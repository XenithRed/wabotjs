import {
  downloadMediaMessage,
  getContentType,
  getDevice,
  isJidGroup,
  jidNormalizedUser,
  WAProto,
} from 'baileys';
import type { WAMessage, AnyMessageContent, MiscMessageGenerationOptions } from 'baileys';
import type { Bot, User } from './Bot.js';
import { assertType, isAnyJIDEqual, resolveLIDOrPN } from './utils/index.js';
import Long from 'long';

/** Represents a WhatsApp chat (group, private, or community) */
export interface Chat {
  jid: string;
  name?: string;
  type: 'private' | 'group' | 'community' | 'unknown';
}
/** Represents the sender of a message */
export interface Sender extends User {
  device: 'ios' | 'android' | 'web' | 'desktop' | 'unknown';
  isMe: boolean;
}
/** High-level wrapper for baileys messages. Abstracts the complexity of {@link WAMessage} objects and exposes straightforward utilities. */
export class Message {
  #raw: WAMessage;
  #bot: Bot;
  /** Unique message ID (`raw.key.id`) */
  id: string;
  /** Chat where the message originated or was sent */
  chat: Chat;
  /** Information about the user who sent the message */
  sender?: Sender;
  /** Readable text extracted from the message */
  text?: string;
  /** List of users explicitly mentioned in the message */
  mentions: User[];
  /** Timestamp of when the message was sent (`raw.messageTimestamp`) */
  timestamp: Long;
  /** Internal message type according to the protocol structure ({@link WAProto.IMessage}) */
  type?: keyof WAProto.IMessage;
  /** MIME type of the multimedia file (e.g., `image/jpeg`, `video/mp4`) */
  mimetype?: string;
  /** SHA256 hash of the multimedia file */
  hash?: Uint8Array;
  /** Multimedia encryption key to decrypt the file */
  key?: Uint8Array;
  /** Direct URL of the multimedia file */
  url?: string;
  /** Direct path of the multimedia file */
  path?: string;
  /** Multimedia file size in bytes */
  size?: Long;
  /** Formatted instance of the message that was quoted/responded to by this */
  quoted?: Message;
  constructor(raw: WAMessage, bot: Bot) {
    assertType(raw.key.id, 'raw.key.id', 'string');
    assertType(raw.key.remoteJid, 'raw.key.remoteJid', 'string');
    this.#raw = raw;
    this.#bot = bot;
    this.id = raw.key.id!;
    this.chat = this.#getChat();
    this.sender = this.#getSender();
    this.text = this.#getText();
    this.mentions = this.#getMentions();
    this.timestamp = Long.fromValue(raw.messageTimestamp || Math.floor(Date.now() / 1000));
    if (raw.message) {
      this.type = this.#getType(raw.message);
      this.mimetype = this.#getMIMEType(raw.message);
      this.hash = this.#getHash(raw.message);
      this.key = this.#getKey(raw.message);
      this.url = this.#getURL(raw.message);
      this.path = this.#getPath(raw.message);
      this.size = this.#getSize(raw.message);
    }
    this.quoted = this.#getQuote();
    if (this.quoted) {
      delete this.quoted.quoted;
    }
  }
  #getContent(msg?: WAProto.IMessage | null) {
    if (!msg) {
      return;
    }
    const type = getContentType(msg);
    return type ? msg[type] : undefined;
  }
  #getChat(): Chat {
    if (isJidGroup(this.#raw.key.remoteJid!)) {
      const jid = this.#raw.key.remoteJid!;
      const group = this.#bot.cache.groups.get(jid);
      return {
        jid,
        name: group?.subject,
        type: group?.isCommunity ? 'community' : 'group',
      };
    }
    const { lid, pn } = resolveLIDOrPN(this.#raw.key.remoteJid, this.#raw.key.remoteJidAlt);
    if (lid || pn) {
      const user = this.#bot.cache.users.get({ lid, pn });
      return {
        jid: (user?.lid || lid || pn)!,
        name: user?.name,
        type: 'private',
      };
    }
    return {
      jid: jidNormalizedUser(this.#raw.key.remoteJid!),
      name: undefined,
      type: 'unknown',
    };
  }
  #getSender(): Sender | undefined {
    if (this.#raw.key.fromMe) {
      return {
        ...this.#bot.me,
        device: getDevice(this.id),
        isMe: true,
      };
    }
    const { lid, pn } = resolveLIDOrPN(this.#raw.key.participant, this.#raw.key.participantAlt);
    if (lid || pn) {
      const user = this.#bot.cache.users.get({ lid, pn });
      if (user) {
        return {
          ...user,
          device: getDevice(this.id),
          isMe: false,
        };
      }
    }
    if (this.chat.type === 'private') {
      const { lid, pn } = resolveLIDOrPN(this.chat.jid);
      if (lid || pn) {
        const user = this.#bot.cache.users.get({ lid, pn });
        if (user) {
          return {
            ...user,
            device: getDevice(this.id),
            isMe: false,
          };
        }
      }
    }
  }
  #getText() {
    const ctn = this.#getContent(this.#raw.message);
    if (!ctn) {
      return;
    }
    return (
      typeof ctn === 'string'
        ? ctn
        : 'text' in ctn
          ? ctn.text
          : 'caption' in ctn
            ? ctn.caption
            : 'selectedButtonId' in ctn
              ? (ctn.selectedButtonId as string)
              : undefined
    )?.trim();
  }
  #getMentions() {
    const ctn = this.#getContent(this.#raw.message);
    if (!ctn || typeof ctn === 'string') {
      return [];
    }
    const mentions = new Set<User>();
    if ('contextInfo' in ctn && Array.isArray(ctn.contextInfo?.mentionedJid)) {
      ctn.contextInfo.mentionedJid.forEach((m) => {
        const { lid, pn } = resolveLIDOrPN(m);
        if (!lid && !pn) {
          return;
        }
        const user = this.#bot.cache.users.get({ lid, pn });
        if (user) {
          mentions.add(user);
        }
      });
    }
    return mentions.values().toArray();
  }
  #getType(msg?: WAProto.IMessage | null): keyof WAProto.IMessage | undefined {
    if (!msg) {
      return;
    }
    const type = getContentType(msg);
    const ctn = this.#getContent(msg);
    return typeof ctn === 'object' && ctn && 'message' in ctn ? this.#getType(ctn.message) : type;
  }
  #getMIMEType(msg?: WAProto.IMessage | null): string | undefined {
    const ctn = this.#getContent(msg);
    if (!ctn || typeof ctn === 'string') {
      return;
    }
    if ('mimetype' in ctn && typeof ctn.mimetype === 'string') {
      return ctn.mimetype;
    }
    if ('message' in ctn) {
      return this.#getMIMEType(ctn.message);
    }
  }
  #getHash(msg?: WAProto.IMessage): Uint8Array | undefined {
    const ctn = this.#getContent(msg);
    if (!ctn || typeof ctn === 'string') {
      return;
    }
    if ('fileSha256' in ctn && ctn.fileSha256) {
      if (ctn.fileSha256 instanceof Buffer) {
        return new Uint8Array(ctn.fileSha256);
      }
      return ctn.fileSha256 as Uint8Array;
    }
    if ('message' in ctn) {
      return this.#getHash(ctn.message || {});
    }
  }
  #getKey(msg?: WAProto.IMessage): Uint8Array | undefined {
    const ctn = this.#getContent(msg);
    if (!ctn || typeof ctn === 'string') {
      return;
    }
    if ('mediaKey' in ctn && ctn.mediaKey) {
      if (ctn.mediaKey instanceof Buffer) {
        return new Uint8Array(ctn.mediaKey);
      }
      return ctn.mediaKey as Uint8Array;
    }
    if ('message' in ctn) {
      return this.#getKey(ctn.message || {});
    }
  }
  #getURL(msg?: WAProto.IMessage | null): string | undefined {
    const ctn = this.#getContent(msg);
    if (!ctn || typeof ctn === 'string') {
      return;
    }
    if ('url' in ctn && typeof ctn.url === 'string') {
      return new URL(ctn.url).href;
    }
    if ('message' in ctn) {
      return this.#getURL(ctn.message);
    }
  }
  #getPath(msg?: WAProto.IMessage | null): string | undefined {
    const ctn = this.#getContent(msg);
    if (!ctn || typeof ctn === 'string') {
      return;
    }
    if ('directPath' in ctn && typeof ctn.directPath === 'string') {
      return ctn.directPath;
    }
    if ('message' in ctn) {
      return this.#getPath(ctn.message);
    }
  }
  #getSize(msg?: WAProto.IMessage | null): Long | undefined {
    const ctn = this.#getContent(msg);
    if (!ctn || typeof ctn === 'string') {
      return;
    }
    this.#raw.message?.imageMessage?.fileLength;
    if ('fileLength' in ctn && ctn.fileLength) {
      return Long.fromValue(ctn.fileLength as Long | number);
    }
    if ('message' in ctn) {
      return this.#getSize(ctn.message);
    }
  }
  #getQuote() {
    const ctn = this.#getContent(this.#raw.message || {});
    if (!ctn || typeof ctn === 'string') {
      return;
    }
    if ('contextInfo' in ctn && ctn.contextInfo?.quotedMessage) {
      const ctx = ctn.contextInfo;
      const fromMe = ctx.participant
        ? isAnyJIDEqual(ctx.participant, this.#bot.me.lid, this.#bot.me.pn)
        : false;
      const msg = {
        key: {
          remoteJid: ctx.remoteJid || this.chat.jid,
          participant: fromMe ? this.#bot.me.lid : ctx.participant,
          id: ctx.stanzaId,
          fromMe,
        },
        message: ctx.quotedMessage,
      };
      return new Message(msg, this.#bot);
    }
  }
  /** Returns baileys native raw message object ({@link WAMessage}) */
  toRaw(): Readonly<WAMessage> {
    return this.#raw;
  }
  /** Download the multimedia file for this message */
  async download() {
    if (!this.url || !this.key || !this.path) {
      throw new Error('this message is not a downloadable multimedia message');
    }
    // If this.url, this.key, and this.path exist, it means that this cannot be undefined
    const ctn = this.#getContent(this.#raw.message!)!;
    if (typeof ctn !== 'string' && 'message' in ctn && ctn.message) {
      return await downloadMediaMessage({ key: this.#raw.key, message: ctn.message }, 'buffer', {});
    }
    return await downloadMediaMessage(this.#raw, 'buffer', {});
  }
  /**
   * Reply directly to this message in the same chat by quoting it automatically
   *
   * @example
   * // Reply with text
   * await msg.reply({ text: '¡Hello, World!' });
   *
   * // Reply with image
   * await msg.reply({ image: { url: 'https://domain.com/image.jpeg' }, caption: '¡Hello, World!' });
   */
  async reply(content: AnyMessageContent, options?: MiscMessageGenerationOptions) {
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, content, {
      ...options,
      quoted: this.#raw,
    });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /**
   * React to this message with an emoji
   *
   * @example
   * await msg.react('👍');
   *
   * // remove the reaction
   * await msg.react('');
   */
  async react(emoji: string) {
    assertType(emoji, 'emoji', 'string');
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, { react: { text: emoji } });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /** Mark this specific message as read */
  async read() {
    await this.#bot.sock.readMessages([this.#raw.key]);
  }
  /** Delete this message from the chat for all participants */
  async delete() {
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, { delete: this.#raw.key });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /**
   * Edit the content of the current message. This only works if the original message was sent by the bot.
   *
   * @example
   * const res = await msg.reply({ text: '¡Ping!' });
   * await res?.edit({ text: '¡Pong!' });
   */
  async edit(content: AnyMessageContent, options?: MiscMessageGenerationOptions) {
    if (!this.sender?.isMe) {
      throw new Error(
        `the message with id ${this.id} cannot be edited because it was not sent by the bot`,
      );
    }
    const msg = await this.#bot.sock.sendMessage(
      this.chat.jid,
      {
        ...content,
        edit: this.#raw.key,
      },
      {
        ...options,
        quoted: this.#raw,
      },
    );
    return msg ? new Message(msg, this.#bot) : undefined;
  }
}
