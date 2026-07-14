import {
  assertType,
  UserCache,
  LRUCache,
  resolveLIDAndPN,
  toError,
  TTLCache,
} from './utils/index.js';
import { pino } from 'pino';
import libpn from 'libphonenumber-js';
import { Boom } from '@hapi/boom';
import type { Output } from '@hapi/boom';
import ms from 'ms';
import type { GroupMetadata, WAMessage } from 'baileys';
import type { AnyMessageContent, MiscMessageGenerationOptions, WAMediaUpload } from 'baileys';
import { delay, DisconnectReason, isJidGroup, isLidUser, isPnUser } from 'baileys';
import { EventEmitter } from 'node:events';
import { Message } from './Message.js';
import type { ExternalAdReplyOptions } from './Message.js';
import { Socket } from './Socket.js';
import { Auth } from './Auth.js';

/** Represents a user in the WhatsApp. */
export interface User {
  /** The user's local identifier. */
  lid: string;
  /** The user's phone number. */
  pn: string;
  /** Display name */
  name?: string;
  /** Soon. */
  username?: string;
}
/** Error codes for the bot. */
export enum ErrorCode {
  /** An unknown error occurred. */
  UNKNOWN = 'UNKNOWN',
  /** The socket connection failed. */
  SOCKET = 'SOCKET',
  /** The authentication state failed to load or save. */
  AUTH = 'AUTH',
  /** The pairing code request failed. */
  PAIRING = 'PAIRING',
  /** The QR code generation failed. */
  QR = 'QR',
  /** A message operation failed. */
  MESSAGE = 'MESSAGE',
  /** A group operation failed. */
  GROUP = 'GROUP',
  /** The login process failed. */
  LOGIN = 'LOGIN',
  /** The logout process failed. */
  LOGOUT = 'LOGOUT',
}
/** Represents an error with a typed code. */
export class BotError extends Error {
  /** The error code. */
  code: ErrorCode;
  /** The original error, if any. */
  cause?: Error;
  constructor(message: string, code: ErrorCode, cause?: Error) {
    super(message);
    this.name = 'BotError';
    this.code = code;
    this.cause = cause;
  }
}
/** Event names for the bot. */
export enum Events {
  /** Event triggered when an error occurs. */
  ERROR = 'error',
  /** Event triggered when a QR code is generated. */
  QR = 'qr',
  /** Event triggered when a pairing code (OTP) is generated. */
  OTP = 'otp',
  /** Event triggered when the connection is closed. */
  CLOSE = 'close',
  /** Event triggered when the connection is opened. */
  OPEN = 'open',
  /** Event triggered when a message is received. */
  MESSAGE = 'message',
  /** Event triggered when a command is received. */
  COMMAND = 'command',
}
/** Event map for the bot. */
export interface EventMap {
  /** @param err The error that occurred. */
  error: [err: Error];
  /** @param str The generated QR code. */
  qr: [str: string];
  /** @param code The generated pairing code (OTP). */
  otp: [code: string];
  /**
   * @param out The disconnect output.
   * @param loggedout If true, it means the session cannot be reconnected.
   */
  close: [out: Output, loggedout: boolean];
  /** @param me The bot's account. */
  open: [me: User];
  /** @param msg The message received. */
  message: [msg: Message];
  /**
   * @param msg The message that triggered the command.
   * @param name The name of the command.
   * @param args The arguments passed to the command.
   */
  command: [msg: Message, name: string, args: string[]];
}
/** Core class for managing the WhatsApp bot. */
export class Bot extends EventEmitter<EventMap> {
  #prefix = '/';
  #reconnectionAttempts = 0;
  #reconnectionTimeout?: NodeJS.Timeout;
  #id: string;
  #sock?: Socket;
  #me?: User;
  #logging = false;
  #logged = false;
  /** The authentication state manager. */
  auth: Auth;
  /** Bot cache. */
  cache: {
    /** User cache. */
    users: UserCache;
    /** Groups metadata cache. */
    groups: LRUCache<GroupMetadata>;
    /** Message cache. */
    messages: TTLCache<WAMessage>;
    /** Clear all caches. */
    flush: () => void;
  };
  /**
   * Creates a new instance of the Bot class.
   * @param id The identifier for the bot.
   * @param auth The authentication state manager.
   */
  constructor(id: string, auth: Auth) {
    assertType(id, 'id', 'string');
    super();
    this.#id = id;
    this.auth = auth;
    this.cache = {
      users: new UserCache(),
      groups: new LRUCache(5),
      messages: new TTLCache(ms('1h')),
      flush: () => {
        this.cache.users.clear();
        this.cache.groups.clear();
        this.cache.messages.clear();
      },
    };
  }
  #handleEvents(pn?: string) {
    this.sock.ev.on('creds.update', () => {
      try {
        this.auth.save();
      } catch (e) {
        this.emit(Events.ERROR, new BotError('Failed to save auth state', ErrorCode.AUTH, toError(e)));
      }
    });
    this.sock.ev.on('connection.update', async (upd) => {
      try {
        if (upd.qr) {
          if (pn && !this.auth.creds.registered) {
            const code = await this.sock.requestPairingCode(pn);
            this.emit(Events.OTP, code);
          } else {
            this.emit(Events.QR, upd.qr);
          }
        }
        if (upd.connection === 'close') {
          await this.close();
          const out = new Boom(upd.lastDisconnect?.error).output;
          const loggedout =
            out.statusCode === DisconnectReason.loggedOut ||
            out.statusCode === DisconnectReason.forbidden ||
            out.statusCode === 405;
          this.emit(Events.CLOSE, out, loggedout);
          if (!loggedout) {
            if (this.#reconnectionAttempts >= 5) {
              await this.logout(new Boom('number of reconnection attempts exceeded'));
              return;
            }
            if (out.statusCode !== DisconnectReason.restartRequired) {
              await delay(ms('5s'));
            }
            this.#reconnectionAttempts++;
            await this.login(pn);
          } else {
            await this.logout();
          }
          return;
        }
        if (upd.connection === 'open') {
          const me = resolveLIDAndPN(
            this.sock.user?.id,
            this.sock.user?.lid,
            this.sock.user?.phoneNumber,
          );
          if (!me) {
            await this.close(
              new Boom('restart required', {
                statusCode: DisconnectReason.restartRequired,
              }),
            );
            return;
          }
          this.#logged = true;
          this.#logging = false;
          this.#reconnectionAttempts = 0;
          if (this.#reconnectionTimeout) {
            clearTimeout(this.#reconnectionTimeout);
            this.#reconnectionTimeout = undefined;
          }
          this.#me = {
            ...me,
            name: this.sock.user!.verifiedName || this.sock.user!.name,
          };
          this.cache.users.set(this.me);
          this.emit(Events.OPEN, this.me);
          return;
        }
        if (upd.connection === 'connecting' && !this.#reconnectionTimeout) {
          this.#reconnectionTimeout = setTimeout(async () => {
            if (!this.#logged) {
              await this.close(
                new Boom(`time to log in expired`, { statusCode: DisconnectReason.loggedOut }),
              );
            }
            this.#reconnectionTimeout = undefined;
          }, ms('60s'));
        }
      } catch (e) {
        this.emit(Events.ERROR, new BotError('Connection update failed', ErrorCode.SOCKET, toError(e)));
      }
    });
    this.sock.ev.on('messages.upsert', async (ups) => {
      try {
        for (const msg of ups.messages) {
          if (!msg.message || !msg.key.remoteJid || !msg.key.id) {
            return;
          }
          if (isJidGroup(msg.key.remoteJid) && !this.cache.groups.has(msg.key.remoteJid)) {
            const metadata = await this.sock
              .groupMetadata(msg.key.remoteJid)
              .catch(() => undefined);
            if (metadata) {
              metadata.participants.forEach((p) => {
                const user: User | undefined = resolveLIDAndPN(p.id, p.lid, p.phoneNumber);
                if (user && !this.cache.users.has(user)) {
                  user.name = undefined;
                  this.cache.users.set(user);
                }
              });
              this.cache.groups.set(msg.key.remoteJid, metadata);
            }
          }
          const sender =
            resolveLIDAndPN(msg.key.participant, msg.key.participantAlt) ||
            resolveLIDAndPN(msg.key.remoteJid, msg.key.remoteJidAlt);
          if (sender) {
            const name = msg.verifiedBizName || msg.pushName || undefined;
            const user = this.cache.users.get(sender);
            if (!user) {
              this.cache.users.set({
                ...sender,
                name: msg.key.fromMe ? undefined : name,
              });
            } else {
              if (name && user.name !== name && !msg.key.fromMe) {
                user.name = name;
              }
              if (name && this.me.name !== name && msg.key.fromMe) {
                this.#me!.name = name;
              }
              if (user.pn !== sender.pn) {
                user.pn = sender.pn;
              }
            }
          }
          if (ups.type === 'append') {
            this.cache.messages.set(msg.key.id, msg);
            return;
          }
          const message = new Message(msg, this);
          this.emit(Events.MESSAGE, message);
          if (!message.text?.startsWith(this.prefix)) {
            return;
          }
          const [name, ...args] = message.text
            .substring(this.#prefix.length)
            .split(/\s+/)
            .map((p, i) => (i === 0 ? p.toLowerCase() : p));
          if (name.length < 1) {
            return;
          }
          this.emit(Events.COMMAND, message, name, args);
        }
      } catch (e) {
        this.emit(Events.ERROR, new BotError('Message processing failed', ErrorCode.MESSAGE, toError(e)));
      }
    });
    this.sock.ev.on('group-participants.update', (upd) => {
      try {
        if (this.cache.groups.has(upd.id)) {
          const participants = new Set(upd.participants.map((p) => p.id));
          const cached = this.cache.groups.get(upd.id)!;
          if (upd.action === 'remove') {
            const idx = cached.participants.findIndex((p) => participants.has(p.id));
            if (idx < 0) {
              return;
            }
            cached.participants.splice(idx, 1);
            participants.clear();
            return;
          }
          if (upd.action === 'add') {
            upd.participants.forEach((up) => {
              if (!cached.participants.some((cp) => participants.has(cp.id))) {
                cached.participants.push({
                  ...up,
                  lid: undefined,
                  username: undefined,
                });
              }
            });
            participants.clear();
            return;
          }
          if (upd.action === 'demote') {
            cached.participants.forEach((p) => {
              if (participants.has(p.id)) {
                p.admin = null;
              }
            });
            participants.clear();
            return;
          }
          if (upd.action === 'promote') {
            cached.participants.forEach((p) => {
              if (participants.has(p.id)) {
                p.admin = 'admin';
              }
            });
            participants.clear();
            return;
          }
        }
      } catch (e) {
        this.emit(Events.ERROR, new BotError('Group participant update failed', ErrorCode.GROUP, toError(e)));
      }
    });
    this.sock.ev.on('groups.update', (upd) => {
      try {
        upd.forEach((u) => {
          if (u.id && this.cache.groups.has(u.id)) {
            const cached = this.cache.groups.get(u.id)!;
            Object.assign(cached, u);
          }
        });
      } catch (e) {
        this.emit(Events.ERROR, new BotError('Group update failed', ErrorCode.GROUP, toError(e)));
      }
    });
  }
  /** Gets the bot's identifier. */
  get id() {
    return this.#id;
  }
  /**
   * Gets the bot's command prefix.
   * @default '/'
   */
  get prefix() {
    return this.#prefix;
  }
  /** Gets the bot's socket. */
  get sock() {
    if (!this.#sock) {
      throw new Error('unlogged, calling .login() first');
    }
    return this.#sock;
  }
  /** Gets the bot's account. */
  get me() {
    if (!this.#me) {
      throw new Error('unlogged, calling .login() first');
    }
    return this.#me;
  }
  /**
   * Sets the bot's command prefix.
   * @param prefix The new command prefix.
   * @returns The bot instance.
   */
  setPrefix(prefix: string) {
    assertType(prefix, 'prefix', 'string');
    this.#prefix = prefix;
    return this;
  }
  /**
   * Log in with your existing authentication state or create a new session.
   * If a phone number is provided, the login method will be by pairing code (OTP), otherwise it will be by QR code.
   * @param pn The phone number in E.164 format.
   */
  async login(pn?: string) {
    try {
      if (this.#logged || this.#logging) {
        return;
      }
      this.#logging = true;
      if (pn) {
        assertType(pn, 'pn', 'string');
        const parsed = libpn(pn.startsWith('+') ? pn : '+' + pn);
        if (!parsed || !parsed.isValid()) {
          throw new TypeError('invalid phone number provided, must be in E.164 format');
        }
        pn = parsed.format('E.164').replace('+', '');
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
              const user: User | undefined = resolveLIDAndPN(p.id, p.lid, p.phoneNumber);
              if (user && !this.cache.users.has(user)) {
                user.name = undefined;
                this.cache.users.set(user);
              }
            });
            this.cache.groups.set(id, metadata);
          }
          return metadata;
        },
      });
      this.#handleEvents(pn);
    } catch (e) {
      this.#logged = false;
      throw toError(e);
    } finally {
      this.#logging = false;
    }
  }
  /**
   * Logs out the bot and drops the authentication state.
   * @param err Optional error to provide context for the logout.
   */
  async logout(err?: Error) {
    try {
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
      this.#reconnectionAttempts = 0;
    }
  }
  /**
   * Closes the bot connection without dropping the authentication state.
   * @param err Optional error to provide context for the closure.
   */
  async close(err?: Error) {
    try {
      if (!this.#sock) {
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
      this.#reconnectionAttempts = 0;
    }
  }
  /**
   * Send a message to any JID.
   * @param jid The destination JID.
   * @param content The message content.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async send(jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions) {
    const msg = await this.sock.sendMessage(jid, content, options);
    return msg ? new Message(msg, this) : undefined;
  }
  /**
   * Send a message with an external ad reply.
   * @param jid The destination JID.
   * @param content The message content.
   * @param adReply The external ad reply options.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async sendAdReply(
    jid: string,
    content: AnyMessageContent,
    adReply: ExternalAdReplyOptions,
    options?: MiscMessageGenerationOptions,
  ) {
    let thumbnail: Uint8Array | undefined;
    if (adReply.thumbnailUrl) {
      try {
        const res = await fetch(adReply.thumbnailUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        thumbnail = new Uint8Array(buf);
      } catch {}
    }
    const contextInfo = {
      ...((content as Record<string, unknown>)?.contextInfo as Record<string, unknown>),
      externalAdReply: {
        title: adReply.title,
        body: adReply.body,
        thumbnailUrl: adReply.thumbnailUrl,
        thumbnail,
        mediaType: adReply.banner ? 1 : adReply.mediaType,
        sourceUrl: adReply.sourceUrl,
        renderLargerThumbnail: adReply.banner ? true : adReply.renderLargerThumbnail,
        showAdAttribution: adReply.showAdAttribution,
      },
    };
    const msg = await this.sock.sendMessage(
      jid,
      { ...content, contextInfo } as AnyMessageContent,
      options,
    );
    return msg ? new Message(msg, this) : undefined;
  }
  /**
   * Send an image to a chat.
   * @param jid The destination JID.
   * @param media The image (Buffer, Stream, URL).
   * @param caption Optional caption for the image.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async sendImage(jid: string, media: WAMediaUpload, caption?: string, options?: MiscMessageGenerationOptions) {
    const msg = await this.sock.sendMessage(jid, { image: media, caption }, options);
    return msg ? new Message(msg, this) : undefined;
  }
  /**
   * Send a video to a chat.
   * @param jid The destination JID.
   * @param media The video (Buffer, Stream, URL).
   * @param caption Optional caption for the video.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async sendVideo(jid: string, media: WAMediaUpload, caption?: string, options?: MiscMessageGenerationOptions) {
    const msg = await this.sock.sendMessage(jid, { video: media, caption }, options);
    return msg ? new Message(msg, this) : undefined;
  }
  /**
   * Send an audio to a chat.
   * @param jid The destination JID.
   * @param media The audio (Buffer, Stream, URL).
   * @param ptt Whether to send as voice note (PTT). Defaults to false.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async sendAudio(jid: string, media: WAMediaUpload, ptt = false, options?: MiscMessageGenerationOptions) {
    const msg = await this.sock.sendMessage(jid, { audio: media, ptt }, options);
    return msg ? new Message(msg, this) : undefined;
  }
  /**
   * Send a document to a chat.
   * @param jid The destination JID.
   * @param media The document (Buffer, Stream, URL).
   * @param mimetype The MIME type of the document.
   * @param fileName The file name to display.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async sendDocument(
    jid: string,
    media: WAMediaUpload,
    mimetype: string,
    fileName: string,
    options?: MiscMessageGenerationOptions,
  ) {
    const msg = await this.sock.sendMessage(jid, { document: media, mimetype, fileName }, options);
    return msg ? new Message(msg, this) : undefined;
  }
  /**
   * Send a sticker to a chat.
   * @param jid The destination JID.
   * @param media The sticker (Buffer, Stream, URL).
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async sendSticker(jid: string, media: WAMediaUpload, options?: MiscMessageGenerationOptions) {
    const msg = await this.sock.sendMessage(jid, { sticker: media }, options);
    return msg ? new Message(msg, this) : undefined;
  }
  /**
   * Get the profile picture URL of a JID with caching.
   * @param jid The JID to get the profile picture for.
   * @param type The type of picture to fetch ('image' or 'preview').
   * @returns The profile picture URL, or undefined if not found.
   */
  async getProfilePicture(jid: string, type: 'image' | 'preview' = 'image') {
    const key = `pp:${jid}:${type}`;
    const cached = this.cache.messages.get(key) as unknown as string | undefined;
    if (cached) {
      return cached;
    }
    const url = await this.sock.profilePictureUrl(jid, type);
    if (url) {
      this.cache.messages.set(key, url as unknown as WAMessage);
    }
    return url;
  }
}
