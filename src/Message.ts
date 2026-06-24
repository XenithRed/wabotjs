import {
  downloadMediaMessage,
  getContentType,
  isJidGroup,
  jidNormalizedUser,
  WAProto,
} from 'baileys';
import type { WAMessage, AnyMessageContent, MiscMessageGenerationOptions } from 'baileys';
import type { Bot, User } from './Bot.js';
import {
  assertType,
  isAnyJIDEqual,
  resolveLID,
  resolveLIDAndPN,
  resolvePN,
} from './utils/index.js';
import Long from 'long';

export interface Chat {
  jid: string;
  name?: string;
  type: 'private' | 'group' | 'community' | 'unknown';
}
export class Message {
  #raw: WAMessage;
  #bot: Bot;
  // raw.key.id
  id: string;
  // chat where the message was sent
  chat: Chat;
  // the user who sent the message
  sender?: User & { isMe: boolean };
  // the text that contained the message
  text?: string;
  // users mentioned in the message
  mentions: User[];
  // raw.messageTimestamp
  timestamp: Long;
  // the message type, ex: conversation, extendedTextMessage, imageMessage, etc
  type?: keyof WAProto.IMessage;
  // the multimedia message MIMEType (raw.message[type].mimetype)
  mimetype?: string;
  // the multimedia message hash (raw.message[type].fileSha256)
  hash?: Uint8Array;
  // the multimedia message key (raw.message[type].mediaKey)
  key?: Uint8Array;
  // the multimedia message url (raw.message[type].url)
  url?: string;
  // the multimedia message path (raw.message[type].directPath)
  path?: string;
  // the multimedia message size (raw.message[type].fileLength)
  size?: Long;
  // quoted message (raw.message[type].contextInfo.quotedMessage)
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
      const jid = jidNormalizedUser(this.#raw.key.remoteJid!);
      const metadata = this.#bot.cache.groups.get(jid);
      return {
        jid,
        name: metadata?.subject,
        type: metadata?.isCommunity ? 'community' : 'group',
      };
    }
    const lid = resolveLID(this.#raw.key.remoteJid, this.#raw.key.remoteJidAlt);
    if (lid) {
      return {
        jid: lid,
        name: this.#raw.verifiedBizName || this.#raw.pushName || undefined,
        type: 'private',
      };
    }
    const pn = resolvePN(this.#raw.key.remoteJid, this.#raw.key.remoteJidAlt);
    if (pn) {
      const lid = this.#bot.cache.users.get({ pn })?.lid;
      if (lid) {
        return {
          jid: lid,
          name: this.#raw.verifiedBizName || this.#raw.pushName || undefined,
          type: 'private',
        };
      }
    }
    return {
      jid: jidNormalizedUser(this.#raw.key.remoteJid!),
      type: 'unknown',
    };
  }
  #getSender(): (User & { isMe: boolean }) | undefined {
    if (this.#raw.key.fromMe) {
      return {
        ...this.#bot.me,
        isMe: true,
      };
    }
    const sender = resolveLIDAndPN(this.#raw.key.participant, this.#raw.key.participantAlt);
    if (sender) {
      return {
        ...sender,
        name: this.#raw.verifiedBizName || this.#raw.pushName || undefined,
        isMe: false,
      };
    }
    const lid = resolveLID(this.#raw.key.participant, this.#raw.key.participantAlt);
    if (lid) {
      const user = this.#bot.cache.users.get({ lid });
      if (user) {
        return {
          ...user,
          name: this.#raw.verifiedBizName || this.#raw.pushName || undefined,
          isMe: false,
        };
      }
    }
    const pn = resolvePN(this.#raw.key.participant, this.#raw.key.participantAlt);
    if (pn) {
      const user = this.#bot.cache.users.get({ pn });
      if (user) {
        return {
          ...user,
          name: this.#raw.verifiedBizName || this.#raw.pushName || undefined,
          isMe: false,
        };
      }
    }
    return;
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
        let user: User | undefined = undefined;
        const lid = resolveLID(m);
        if (lid) {
          user = this.#bot.cache.users.get({ lid });
        }
        const pn = resolvePN(m);
        if (pn) {
          user = this.#bot.cache.users.get({ pn });
        }
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
  // the raw message returns
  toRaw() {
    return this.#raw;
  }
  // download the multimedia message
  async download() {
    if (!this.url || !this.key || !this.path) {
      throw new Error('this message is not a downloadable multimedia message');
    }
    const ctn = this.#getContent(this.#raw.message!)!;
    if (typeof ctn !== 'string' && 'message' in ctn && ctn.message) {
      return await downloadMediaMessage({ key: this.#raw.key, message: ctn.message }, 'buffer', {});
    }
    return await downloadMediaMessage(this.#raw, 'buffer', {});
  }
  // reply to the message, a shortcut for bot.sock.sendMessage()
  async reply(content: AnyMessageContent, options?: MiscMessageGenerationOptions) {
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, content, {
      ...options,
      quoted: this.#raw,
    });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  // react with an emoji to the message, a shortcut for bot.sock.sendMessage()
  async react(emoji: string) {
    assertType(emoji, 'emoji', 'string');
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, { react: { text: emoji } });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  // marks the message as read, a shortcut for bot.sock.readMessages()
  async read() {
    await this.#bot.sock.readMessages([this.#raw.key]);
  }
  // deletes the message from the chat, a shortcut for bot.sock.sendMessage()
  async delete() {
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, { delete: this.#raw.key });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  // edit the message if it was sent by the bot, a shortcut for bot.sock.sendMessage()
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
