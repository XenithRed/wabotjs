import * as baileys from 'baileys';
import type Bot from './Bot.js';
import Utils from './Utils/index.js';
import Long from 'long';

export default class Message {
  #raw: baileys.WAMessage;
  #bot: Bot;
  id: string;
  chat: string;
  sender?: string;
  text?: string;
  mentions: string[];
  timestamp: number;
  type?: keyof baileys.WAProto.IMessage;
  mimetype?: string;
  hash?: Buffer;
  key?: Buffer;
  url?: URL;
  path?: string;
  quoted?: Message;
  constructor(raw: baileys.WAMessage, bot: Bot) {
    Utils.assertType(raw.key.id, 'raw.key.id', 'string');
    Utils.assertType(raw.key.remoteJid, 'raw.key.remoteJid', 'string');
    this.#raw = raw;
    this.#bot = bot;
    this.id = raw.key.id!;
    this.chat = this.#getChat();
    this.sender = this.#getSender();
    this.text = this.#getText();
    this.mentions = this.#getMentions();
    this.timestamp = Long.fromValue(
      raw.messageTimestamp || Math.floor(Date.now() / 1000),
    ).toNumber();
    if (raw.message) {
      this.type = this.#getType(raw.message);
      this.mimetype = this.#getMIMEType(raw.message);
      this.hash = this.#getHash(raw.message);
      this.key = this.#getKey(raw.message);
      this.url = this.#getURL(raw.message);
      this.path = this.#getPath(raw.message);
    }
    this.quoted = this.#getQuote();
  }
  #getContent(m?: baileys.WAProto.IMessage) {
    if (!m) {
      return undefined;
    }
    const type = baileys.getContentType(m);
    return type ? m[type] : undefined;
  }
  #getChat() {
    if (baileys.isJidGroup(this.#raw.key.remoteJid!)) {
      return this.#raw.key.remoteJid!;
    }
    const lid = Utils.resolveLID(this.#raw.key.remoteJid, this.#raw.key.remoteJidAlt);
    if (lid) {
      return lid;
    }
    const pn = Utils.resolvePN(this.#raw.key.remoteJid, this.#raw.key.remoteJidAlt);
    if (pn) {
      const resolved = this.#bot.cache.jid.resolve(pn);
      if (resolved) {
        return resolved.lid;
      }
    }
    return this.#raw.key.remoteJid!;
  }
  #getSender() {
    if (this.#raw.key.fromMe) {
      return Utils.resolveLID(
        this.#bot.sock.user!.lid,
        this.#bot.sock.user!.id,
        this.#bot.sock.user!.phoneNumber,
      );
    }
    let sender = Utils.resolveLID(this.#raw.key.participant, this.#raw.key.participantAlt);
    if (!sender) {
      const pn = Utils.resolvePN(this.#raw.key.participant, this.#raw.key.participantAlt);
      if (pn) {
        const resolved = this.#bot.cache.jid.resolve(pn);
        if (resolved) {
          sender = resolved.lid;
        }
      }
    }
    if (!sender) {
      sender = Utils.resolveLID(this.#raw.key.remoteJid, this.#raw.key.remoteJidAlt);
    }
    if (!sender) {
      const pn = Utils.resolvePN(this.#raw.key.remoteJid, this.#raw.key.remoteJidAlt);
      if (pn) {
        const resolved = this.#bot.cache.jid.resolve(pn);
        if (resolved) {
          sender = resolved.lid;
        }
      }
    }
    return sender;
  }
  #getText() {
    const ctn = this.#getContent(this.#raw.message || {});
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
            : undefined
    )?.trim();
  }
  #getMentions() {
    const ctn = this.#getContent(this.#raw.message || {});
    if (!ctn || typeof ctn === 'string') {
      return [];
    }
    const mentions = new Set<string>();
    if ('contextInfo' in ctn && Array.isArray(ctn.contextInfo?.mentionedJid)) {
      for (const m of ctn.contextInfo.mentionedJid) {
        if (baileys.isPnUser(m)) {
          const resolved = this.#bot.cache.jid.resolve(m);
          if (resolved?.lid) {
            mentions.add(resolved.lid);
            continue;
          }
        }
        mentions.add(m);
      }
    }
    return mentions.values().toArray();
  }
  #getType(m?: baileys.WAProto.IMessage): keyof baileys.WAProto.IMessage | undefined {
    const type = baileys.getContentType(m);
    const ctn = this.#getContent(m);
    return typeof ctn === 'object' && ctn && 'message' in ctn
      ? this.#getType(ctn.message || {})
      : type;
  }
  #getMIMEType(m?: baileys.WAProto.IMessage): string | undefined {
    const ctn = this.#getContent(m);
    if (!ctn || typeof ctn === 'string') {
      return undefined;
    }
    if ('mimetype' in ctn && typeof ctn.mimetype === 'string') {
      return ctn.mimetype;
    }
    if ('message' in ctn) {
      return this.#getMIMEType(ctn.message || {});
    }
    return undefined;
  }
  #getHash(m?: baileys.WAProto.IMessage): Buffer | undefined {
    const ctn = this.#getContent(m);
    if (!ctn || typeof ctn === 'string') {
      return undefined;
    }
    if (
      'fileSha256' in ctn &&
      (ctn.fileSha256 instanceof Uint8Array || ctn.fileSha256 instanceof Buffer)
    ) {
      return Buffer.from(ctn.fileSha256);
    }
    if ('message' in ctn) {
      return this.#getHash(ctn.message || {});
    }
    return undefined;
  }
  #getKey(m?: baileys.WAProto.IMessage): Buffer | undefined {
    const ctn = this.#getContent(m);
    if (!ctn || typeof ctn === 'string') {
      return undefined;
    }
    if (
      'mediaKey' in ctn &&
      (ctn.mediaKey instanceof Uint8Array || ctn.mediaKey instanceof Buffer)
    ) {
      return Buffer.from(ctn.mediaKey);
    }
    if ('message' in ctn) {
      return this.#getKey(ctn.message || {});
    }
    return undefined;
  }
  #getURL(m?: baileys.WAProto.IMessage): URL | undefined {
    const ctn = this.#getContent(m);
    if (!ctn || typeof ctn === 'string') {
      return undefined;
    }
    if ('url' in ctn && typeof ctn.url === 'string') {
      return new URL(ctn.url);
    }
    if ('message' in ctn) {
      return this.#getURL(ctn.message || {});
    }
    return undefined;
  }
  #getPath(m?: baileys.WAProto.IMessage): string | undefined {
    const ctn = this.#getContent(m);
    if (!ctn || typeof ctn === 'string') {
      return undefined;
    }
    if ('directPath' in ctn && typeof ctn.directPath === 'string') {
      return ctn.directPath;
    }
    if ('message' in ctn) {
      return this.#getPath(ctn.message || {});
    }
    return undefined;
  }
  #getQuote() {
    const ctn = this.#getContent(this.#raw.message || {});
    if (!ctn || typeof ctn === 'string') {
      return undefined;
    }
    if ('contextInfo' in ctn && ctn.contextInfo?.quotedMessage) {
      const ctxInfo = ctn.contextInfo;
      const fromMe = ctxInfo.participant
        ? [
            baileys.jidNormalizedUser(this.#bot.sock.user!.id || ''),
            baileys.jidNormalizedUser(this.#bot.sock.user!.lid || ''),
            baileys.jidNormalizedUser(this.#bot.sock.user!.phoneNumber || ''),
          ].includes(baileys.jidNormalizedUser(ctxInfo.participant))
        : false;
      const quoted: baileys.WAMessage = {
        key: {
          remoteJid: ctxInfo.remoteJid || this.chat,
          participant: fromMe
            ? baileys.jidNormalizedUser(this.#bot.sock.user!.lid || '')
            : ctxInfo.participant,
          participantAlt: fromMe
            ? baileys.jidNormalizedUser(this.#bot.sock.user!.id || '')
            : undefined,
          id: ctxInfo.stanzaId,
          fromMe,
          addressingMode: baileys.isLidUser(ctxInfo.participant || '')
            ? 'lid'
            : baileys.isPnUser(ctxInfo.participant || '')
              ? 'pn'
              : undefined,
        },
        message: ctxInfo.quotedMessage,
      };
      return new Message(quoted, this.#bot);
    }
    return undefined;
  }
  toRaw() {
    return this.#raw;
  }
  isFromMe() {
    return this.#raw.key.fromMe || false;
  }
  isGroup() {
    return baileys.isJidGroup(this.chat);
  }
  async download() {
    if (!this.url || !this.key || !this.path) {
      throw new Error('this message is not a downloadable multimedia message');
    }
    const ctn = this.#getContent(this.#raw.message!)!;
    if (typeof ctn !== 'string' && 'message' in ctn && ctn.message) {
      return await baileys.downloadMediaMessage({ key: {}, message: ctn.message }, 'buffer', {});
    }
    return await baileys.downloadMediaMessage(this.#raw, 'buffer', {});
  }
  async reply(
    content: baileys.AnyMessageContent,
    options?: Omit<baileys.MiscMessageGenerationOptions, 'quoted'>,
  ) {
    const m = await this.#bot.sock.sendMessage(this.chat, content, {
      ...options,
      quoted: this.#raw,
    });
    return m ? new Message(m, this.#bot) : undefined;
  }
  async react(emoji: string) {
    Utils.assertType(emoji, 'emoji', 'string');
    const m = await this.#bot.sock.sendMessage(this.chat, { react: { text: emoji } });
    return m ? new Message(m, this.#bot) : undefined;
  }
  async read() {
    await this.#bot.sock.readMessages([this.#raw.key]);
  }
  async delete() {
    const m = await this.#bot.sock.sendMessage(this.chat, { delete: this.#raw.key });
    return m ? new Message(m, this.#bot) : undefined;
  }
  async edit(
    content: baileys.AnyMessageContent,
    options?: Omit<baileys.MiscMessageGenerationOptions, 'quoted'>,
  ) {
    if (!this.isFromMe()) {
      throw new Error(
        `the message with id ${this.id} cannot be edited because it was not sent by the bot`,
      );
    }
    const m = await this.#bot.sock.sendMessage(
      this.chat,
      {
        ...content,
        edit: this.#raw.key,
      },
      {
        ...options,
        quoted: this.#raw,
      },
    );
    return m ? new Message(m, this.#bot) : undefined;
  }
}
