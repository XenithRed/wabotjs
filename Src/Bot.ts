import * as baileys from 'baileys';
import Auth from './Auth.js';
import Utils from './Utils/index.js';
import pino from 'pino';
import libphonenumber from 'libphonenumber-js';
import boom from '@hapi/boom';
import Socket from './Socket.js';
import Cache from './Cache/index.js';
import path from 'node:path';
import Message from './Message.js';
import ms from 'ms';

export default class Bot {
  #prefix = '/';
  #retryDelay = ms('5s');
  #maxRetryDelay = ms('5m');
  #id: string;
  #datadir: string;
  #sock?: Socket;
  #logging = false;
  #logged = false;
  #onError = async (err: Error) => {
    console.warn('function .onError() not defined');
    console.error(err);
  };
  #onQR = async (str: string) => {
    console.warn('function .onQR() not defined');
  };
  #onOTP = async (code: string) => {
    console.warn('function .onOTP() not defined');
  };
  #onClose = async (err: boom.Output) => {};
  #onOpen = async (user: baileys.Contact) => {};
  #onMessage = async (m: Message) => {};
  #onCommand = async (m: Message, prefix: string, name: string, args: string[]) => {};
  auth: Auth;
  cache: {
    jid: InstanceType<typeof Cache.JID>;
    message: InstanceType<typeof Cache.Message>;
    metadata: InstanceType<typeof Utils.TTLCache<baileys.GroupMetadata>>;
  };
  constructor(id: string, datadir: string) {
    Utils.assertType(id, 'id', 'string');
    Utils.assertType(datadir, 'datadir', 'string');
    this.#id = id;
    this.#datadir = path.isAbsolute(datadir) ? datadir : path.resolve(datadir);
    this.auth = new Auth(this.#datadir);
    this.cache = {
      jid: new Cache.JID(this.#datadir),
      message: new Cache.Message(this.#datadir),
      metadata: new Utils.TTLCache(ms('10m')),
    };
  }
  get id() {
    return this.#id;
  }
  get prefix() {
    return this.#prefix;
  }
  get sock() {
    if (!this.#sock) {
      throw new Error('uninitialized sock, calling .login() first');
    }
    return this.#sock;
  }
  onError(cb: (err: Error) => Promise<void>) {
    Utils.assertType(cb, 'cb', 'function');
    this.#onError = cb;
    return this;
  }
  onQR(cb: (str: string) => Promise<void>) {
    Utils.assertType(cb, 'cb', 'function');
    this.#onQR = cb;
    return this;
  }
  onOTP(cb: (code: string) => Promise<void>) {
    Utils.assertType(cb, 'cb', 'function');
    this.#onOTP = cb;
    return this;
  }
  onClose(cb: (err: boom.Output) => Promise<void>) {
    Utils.assertType(cb, 'cb', 'function');
    this.#onClose = cb;
    return this;
  }
  onOpen(cb: (user: baileys.Contact) => Promise<void>) {
    Utils.assertType(cb, 'cb', 'function');
    this.#onOpen = cb;
    return this;
  }
  onMessage(cb: (m: Message) => Promise<void>) {
    Utils.assertType(cb, 'cb', 'function');
    this.#onMessage = cb;
    return this;
  }
  onCommand(cb: (m: Message, prefix: string, name: string, args: string[]) => Promise<void>) {
    Utils.assertType(cb, 'cb', 'function');
    this.#onCommand = cb;
    return this;
  }
  setPrefix(prefix: string) {
    Utils.assertType(prefix, 'prefix', 'string');
    this.#prefix = prefix;
    return this;
  }
  async login(pn?: string) {
    try {
      if (this.#logged || this.#logging) {
        return;
      }
      this.#logging = true;
      if (pn) {
        Utils.assertType(pn, 'pn', 'string');
        if (!libphonenumber(pn.startsWith('+') ? pn : '+' + pn)?.isValid()) {
          throw new TypeError('invalid phone number');
        }
      }
      if (this.#sock) {
        await this.close();
      }
      this.auth.load();
      const ww = await baileys.fetchLatestWaWebVersion({
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
        },
      });
      if (ww.error) {
        throw Utils.toError(ww.error);
      }
      this.#sock = new Socket({
        auth: this.auth.state,
        version: ww.version,
        browser: baileys.Browsers.ubuntu('Firefox'),
        logger: pino({ level: 'silent' }),
        options: {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
          },
        },
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
        linkPreviewImageThumbnailWidth: 1080,
        qrTimeout: ms('30s'),
        connectTimeoutMs: ms('60s'),
        maxMsgRetryCount: 5,
        shouldIgnoreJid: (j) => {
          return !baileys.isPnUser(j) && !baileys.isLidUser(j) && !baileys.isJidGroup(j);
        },
        getMessage: async (k) => {
          return k.id ? this.cache.message.resolve(k.id) : undefined;
        },
        cachedGroupMetadata: async (j) => {
          if (this.cache.metadata.has(j)) {
            return this.cache.metadata.get(j);
          }
          const metadata = await this.sock.groupMetadata(j).catch(() => undefined);
          if (metadata) {
            this.cache.metadata.set(j, metadata);
          }
          return metadata;
        },
      });
      this.cache.jid.bind(this.sock);
      this.cache.message.bind(this.sock);
      this.sock.ev.on('creds.update', () => {
        try {
          this.auth.saveCreds();
        } catch (v) {
          this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v)));
        }
      });
      this.sock.ev.on('connection.update', async (u) => {
        try {
          if (u.qr) {
            if (pn && !this.auth.state.creds.registered) {
              const code = await this.sock.requestPairingCode(pn.replace(/[^0-9]/g, ''));
              this.#onOTP(code).catch((v) =>
                this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v))),
              );
            } else {
              this.#onQR(u.qr).catch((v) =>
                this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v))),
              );
            }
          }
          if (u.connection === 'close') {
            const err = new boom.Boom(u.lastDisconnect?.error).output;
            if (
              err.statusCode !== baileys.DisconnectReason.loggedOut &&
              err.statusCode !== baileys.DisconnectReason.forbidden &&
              err.statusCode !== 405 &&
              err.statusCode !== 400
            ) {
              if (err.statusCode !== baileys.DisconnectReason.restartRequired) {
                await Utils.delay(this.#retryDelay);
                this.#retryDelay = Math.min(this.#retryDelay * 2, this.#maxRetryDelay);
              }
              await this.login(pn);
            } else {
              this.#onClose(err).catch((v) =>
                this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v))),
              );
              await this.logout();
            }
            return;
          }
          if (u.connection === 'open') {
            if (!this.sock.user) {
              await this.sock.end(
                new boom.Boom('restart required', {
                  statusCode: baileys.DisconnectReason.restartRequired,
                }),
              );
              return;
            }
            this.#logged = true;
            this.#retryDelay = ms('5s');
            this.#onOpen(this.sock.user).catch((v) =>
              this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v))),
            );
          }
        } catch (v) {
          this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v)));
        }
      });
      this.sock.ev.on('messages.upsert', (u) => {
        try {
          if (u.type !== 'notify') {
            return;
          }
          for (const msg of u.messages) {
            if (msg.message && msg.key.remoteJid && msg.key.id) {
              const m = new Message(msg, this);
              this.#onMessage(m).catch((v) =>
                this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v))),
              );

              if (!m.text?.startsWith(this.#prefix)) {
                continue;
              }
              const [name, ...args] = m.text
                .substring(this.#prefix.length)
                .split(/\s+/)
                .map((v, i) => (i === 0 ? v.toLowerCase() : v));
              if (name.length < 1) {
                continue;
              }
              this.#onCommand(m, this.#prefix, name, args).catch((v) =>
                this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v))),
              );
            }
          }
        } catch (v) {
          this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v)));
        }
      });
    } catch (v) {
      this.#logged = false;
      this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v)));
    } finally {
      this.#logging = false;
    }
  }
  async logout() {
    try {
      if (!this.#sock) {
        return;
      }
      await this.sock.logout().catch(() => void 0);
      //@ts-ignore
      this.sock.ev.removeAllListeners(undefined);
      this.auth.drop();
      this.cache.jid.drop();
      this.cache.message.drop();
    } catch (v) {
      this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v)));
    } finally {
      this.#sock = undefined;
      this.#logging = false;
      this.#logged = false;
    }
  }
  async close() {
    try {
      if (!this.#sock) {
        return;
      }
      await this.sock.end().catch(() => void 0);
      //@ts-ignore
      this.sock.ev.removeAllListeners(undefined);
    } catch (v) {
      this.#onError(Utils.toError(v)).catch((v) => console.error(Utils.toError(v)));
    } finally {
      this.#sock = undefined;
      this.#logging = false;
      this.#logged = false;
    }
  }
}
