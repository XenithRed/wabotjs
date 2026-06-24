import { assertType, Cache, LRUCache, resolveLIDAndPN, toError, TTLCache } from './utils/index.js';
import { pino } from 'pino';
import libpn from 'libphonenumber-js';
import { Boom } from '@hapi/boom';
import type { Output } from '@hapi/boom';
import ms from 'ms';
import type { GroupMetadata, WAMessage } from 'baileys';
import {
  delay,
  DisconnectReason,
  fetchLatestWaWebVersion,
  isJidGroup,
  isLidUser,
  isPnUser,
  jidDecode,
} from 'baileys';
import { EventEmitter } from 'node:events';
import { Message } from './Message.js';
import { Socket } from './Socket.js';
import { Auth } from './Auth.js';

export interface User {
  lid: string;
  pn: string;
  name?: string;
}
export enum Events {
  ERROR = 'error',
  QR = 'qr',
  OTP = 'otp',
  CLOSE = 'close',
  OPEN = 'open',
  MESSAGE = 'message',
  COMMAND = 'command',
}
interface EventMap {
  error: [err: Error];
  qr: [str: string];
  otp: [code: string];
  close: [out: Output];
  open: [user: User];
  message: [message: Message];
  command: [message: Message, name: string, args: string[]];
}
/**
 * @example
 * ```ts
 * // bot.ts
 *
 * import { Bot, Auth, Events, jidDecode } from '@jzszdznzzl/wabotjs';
 * import { join } from 'node:path';
 * import { toString } from 'qrcode';
 *
 * // An identifier for your bot, useful if you're going to have multiple bots
 * const id = 'my-bot';
 * const auth = new Auth(join(process.cwd(), 'sessions', id));
 * const bot = new Bot(id, auth)
 *   .on(Events.CLOSE, (out) => {
 *     console.warn('Bot connection closed');
 *     console.dir(out, { depth: null });
 *   })
 *   .on(Events.OPEN, (user) => {
 *     console.log(`Bot connection open in ${user.name}(${jidDecode(user.pn)!.user})`);
 *   })
 *   // If the .login() function was called without passing it a phone number, this event will be triggered
 *   .on(Events.QR, async (str) => {
 *     const qr = await toString(str, { type: 'terminal', small: true });
 *     console.log('QR code');
 *     console.log(qr);
 *   })
 *   // If the .login() function is called passing it a phone number, this event will be triggered
 *   .on(Events.OTP, (code) => {
 *     console.log('Pairing code');
 *     console.log(code);
 *   })
 *   // By default it is '/'
 *   .setPrefix('!')
 *   .on(Events.COMMAND, async (msg, name, args) => {
 *     try {
 *       if (['ping', 'p'].includes(name)) {
 *         await msg.reply({ text: '¡Pong!' });
 *         return;
 *       }
 *       if (['echo', 'say'].includes(name)) {
 *         await msg.reply({ text: args.length > 0 ? args.join(' ') : '¡Hello, World!' });
 *         return;
 *       }
 *       await msg.reply({ text: `The ${bot.prefix + name} command does not exist` });
 *     } catch (e) {
 *       console.warn(`Error executing the ${bot.prefix + name} command`);
 *       console.error(e);
 *     }
 *   })
 *   .on(Events.ERROR, (err) => {
 *     console.warn('An error occurred');
 *     console.error(err);
 *   });
 *
 * // Log in with QR code
 * await bot.login();
 * ```
 */
export class Bot extends EventEmitter<EventMap> {
  #prefix = '/';
  #reconnectionAttempts = 0;
  #id: string;
  #sock?: Socket;
  #me?: User;
  #logging = false;
  #logged = false;
  auth: Auth;
  cache: {
    users: Cache<User>;
    groups: LRUCache<GroupMetadata>;
    messages: TTLCache<WAMessage>;
    // shortcut to empty the 3 caches
    flush: () => void;
  };
  constructor(id: string, auth: Auth) {
    assertType(id, 'id', 'string');
    super();
    this.#id = id;
    this.auth = auth;
    this.cache = {
      users: new Cache(),
      groups: new LRUCache(5),
      messages: new TTLCache(ms('1h')),
      flush: () => {
        this.cache.users.clear();
        this.cache.groups.clear();
        this.cache.messages.clear();
      },
    };
  }
  // unique identifier of the bot
  get id() {
    return this.#id;
  }
  // by default it is '/'
  get prefix() {
    return this.#prefix;
  }
  get sock() {
    if (!this.#logged) {
      throw new Error('unlogged, calling .login() first');
    }
    return this.#sock!;
  }
  get me() {
    if (!this.#logged) {
      throw new Error('unlogged, calling .login() first');
    }
    return this.#me!;
  }
  setPrefix(prefix: string) {
    assertType(prefix, 'prefix', 'string');
    this.#prefix = prefix;
    return this;
  }
  /**
   * if a phone number is provided, login will be via an OTP code; otherwise, login will be via a QR code
   * @param pn phone number in international format
   */
  async login(pn?: string) {
    try {
      if (this.#logged || this.#logging) {
        return;
      }
      this.#logging = true;
      if (pn) {
        assertType(pn, 'pn', 'string');
        if (!libpn(pn.startsWith('+') ? pn : '+' + pn)?.isValid()) {
          throw new TypeError('invalid phone number');
        }
      }
      const waver = await fetch(
        'https://raw.githubusercontent.com/jzszdznzzl/wabotjs/refs/heads/main/wa-version.json',
      ).then((r) => r.json() as Promise<[number, number, number]>);
      this.auth.load();
      this.#sock = new Socket({
        auth: { creds: this.auth.creds, keys: this.auth.keys },
        version: waver,
        browser: ['Ubuntu', 'Firefox', '26.0'],
        logger: pino({ level: 'silent' }),
        options: {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
          },
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        linkPreviewImageThumbnailWidth: 1080,
        qrTimeout: ms('30s'),
        maxMsgRetryCount: 5,
        shouldIgnoreJid: (jid) => {
          return !isPnUser(jid) && !isLidUser(jid) && !isJidGroup(jid);
        },
        getMessage: async (key) => {
          if (key.id) {
            return this.cache.messages.get(key.id)?.message || undefined;
          }
          return undefined;
        },
        cachedGroupMetadata: async (id) => {
          if (this.cache.groups.has(id)) {
            return this.cache.groups.get(id);
          }
          const metadata = await this.sock.groupMetadata(id).catch(() => undefined);
          if (metadata) {
            metadata.participants.forEach((p) => {
              const resolved = resolveLIDAndPN(p.id, p.lid, p.phoneNumber);
              if (resolved) {
                this.cache.users.set(resolved);
              }
            });
            this.cache.groups.set(id, metadata);
          }
          return metadata;
        },
      });
      this.sock.ev.on('creds.update', () => {
        try {
          this.auth.save();
        } catch (e) {
          this.emit(Events.ERROR, toError(e));
        }
      });
      this.sock.ev.on('connection.update', async (upd) => {
        try {
          if (upd.qr) {
            if (pn && !this.auth.creds.registered) {
              const code = await this.sock.requestPairingCode(pn.replace(/[^0-9]/g, ''));
              this.emit(Events.OTP, code);
            } else {
              this.emit(Events.QR, upd.qr);
            }
          }
          if (upd.connection === 'close') {
            await this.close();
            const out = new Boom(upd.lastDisconnect?.error).output;
            this.emit(Events.CLOSE, out);
            if (
              out.statusCode !== DisconnectReason.loggedOut &&
              out.statusCode !== DisconnectReason.forbidden &&
              out.statusCode !== 405
            ) {
              if (out.statusCode !== DisconnectReason.restartRequired) {
                await delay(ms('5s'));
              }
              if (this.#reconnectionAttempts >= 5) {
                await this.logout(new Boom('number of reconnection attempts exceeded'));
                return;
              }
              await this.login(pn);
            } else {
              await this.logout();
            }
            return;
          }
          if (upd.connection === 'open') {
            const resolved = resolveLIDAndPN(
              this.sock.user?.id,
              this.sock.user?.lid,
              this.sock.user?.phoneNumber,
            );
            // this will rarely fail and reconnect
            if (!resolved) {
              await this.sock.end(
                new Boom('restart required', {
                  statusCode: DisconnectReason.restartRequired,
                }),
              );
              return;
            }
            this.#logged = true;
            this.#reconnectionAttempts = 0;
            this.#me = {
              ...resolved,
              name: this.sock.user!.verifiedName || this.sock.user!.name,
            };
            this.emit(Events.OPEN, this.me);
          }
        } catch (e) {
          this.emit(Events.ERROR, toError(e));
        }
      });
      this.sock.ev.on('messages.upsert', (ups) => {
        try {
          ups.messages.forEach((m) => {
            if (!m.message || !m.key.remoteJid || !m.key.id) {
              return;
            }
            if (ups.type === 'append') {
              // we only cache the messages sent by the bot
              this.cache.messages.set(m.key.id, m);
              return;
            }
            const message = new Message(m, this);
            this.emit(Events.MESSAGE, message);
            if (!message.text?.startsWith(this.prefix)) {
              return;
            }
            const [name, ...args] = message.text
              .substring(this.#prefix.length)
              .split(/\s+/)
              .map((p, i) => (i === 0 ? p.toLowerCase() : p));
            // we ignore messages that only have the prefix
            if (name.length < 1) {
              return;
            }
            this.emit(Events.COMMAND, message, name, args);
          });
        } catch (e) {
          this.emit(Events.ERROR, toError(e));
        }
      });
    } catch (e) {
      this.#logged = false;
      throw toError(e);
    } finally {
      this.#logging = false;
    }
  }
  // deletes the socket session
  async logout(err?: Error) {
    try {
      if (!this.#logged) {
        throw new Error('unlogged');
      }
      await this.sock.logout(err).catch(() => void 0);
      //@ts-ignore
      this.sock.ev.removeAllListeners(undefined);
      this.auth.drop();
    } catch (e) {
      throw toError(e);
    } finally {
      this.#sock = undefined;
      this.#logging = false;
      this.#logged = false;
      this.cache.flush();
    }
  }
  // close the socket without removing the session
  async close(err?: Error) {
    try {
      if (!this.#logged) {
        throw new Error('unlogged');
      }
      await this.sock.end(err).catch(() => void 0);
      //@ts-ignore
      this.sock.ev.removeAllListeners(undefined);
    } catch (e) {
      throw toError(e);
    } finally {
      this.#sock = undefined;
      this.#logging = false;
      this.#logged = false;
      this.cache.flush();
    }
  }
}
