import { downloadMediaMessage, getDevice, isJidGroup, jidNormalizedUser, WAProto } from 'baileys';
import type { WAMessage, AnyMessageContent, MiscMessageGenerationOptions, WAMediaUpload } from 'baileys';
import type { Bot, User } from './Bot.js';
import { assertType, isAnyJIDEqual, resolveLIDOrPN } from './utils/index.js';
import Long from 'long';

/** Options for an external ad reply. */
export interface ExternalAdReplyOptions {
  /** The title of the ad reply. */
  title: string;
  /** The body of the ad reply. */
  body?: string;
  /** The thumbnail URL of the ad reply. */
  thumbnailUrl?: string;
  /** The media type of the ad reply (1 = image, 2 = video, 3 = audio). */
  mediaType?: number;
  /** The source URL of the ad reply. */
  sourceUrl?: string;
  /** Whether to render a larger thumbnail (banner style). */
  renderLargerThumbnail?: boolean;
  /** Whether to show ad attribution. */
  showAdAttribution?: boolean;
  /** If true, renders the thumbnail as a large banner with mediaType 1 (image). */
  banner?: boolean;
}

/** Represents a chat in the WhatsApp. */
export interface Chat {
  /** The chat JID. */
  jid: string;
  /** Display name. */
  name?: string;
  /** Deduced through the chat JID. */
  type: 'private' | 'group' | 'community' | 'unknown';
}
/** Represents the sender of a message. */
export interface Sender extends User {
  /** Deduced through the message ID. */
  device: 'ios' | 'android' | 'web' | 'desktop' | 'unknown';
  /** If the message was sent by the bot. */
  isMe: boolean;
}
/** Represents a message in the WhatsApp. */
export class Message {
  #raw: WAMessage;
  #bot: Bot;
  /** The ID of the message. */
  id: string;
  /** The chat to which the message belongs. */
  chat: Chat;
  /** The sender of the message. */
  sender?: Sender;
  /** The sender JID as a plain string for quick comparisons. */
  senderJid: string;
  /** The text content of the message. */
  text?: string;
  /** The users mentioned in the message. */
  mentions: User[];
  /** The timestamp (UNIX) of the message. */
  timestamp: Long;
  /** The type of the message. */
  type?: keyof WAProto.IMessage;
  /** The MIME type of the message. */
  mimetype?: string;
  /** The hash of the message. */
  hash?: Uint8Array;
  /** The key of the message. */
  key?: Uint8Array;
  /** The URL of the message. */
  url?: string;
  /** The path of the message. */
  path?: string;
  /** The size (bytes) of the message. */
  size?: Long;
  /** The quoted message. */
  quoted?: Message;
  /**
   * Creates a new Message instance.
   * @param raw The raw WAMessage object from baileys.
   * @param bot The bot instance that received the message.
   */
  constructor(raw: WAMessage, bot: Bot) {
    assertType(raw.key.id, 'raw.key.id', 'string');
    assertType(raw.key.remoteJid, 'raw.key.remoteJid', 'string');
    this.#raw = raw;
    this.#bot = bot;
    this.id = raw.key.id!;
    this.chat = this.#getChat();
    this.sender = this.#getSender();
    this.senderJid = this.#getSenderJid();
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
  #getContentType(msg?: WAProto.IMessage | null) {
    if (!msg) {
      return;
    }
    return (Object.keys(msg) as (keyof WAProto.IMessage)[])
      .filter((k) => k !== 'senderKeyDistributionMessage' && k !== 'messageContextInfo')
      .at(0);
  }
  #getContent(msg?: WAProto.IMessage | null) {
    const type = this.#getContentType(msg);
    return msg && type ? msg[type] : undefined;
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
  #getSenderJid(): string {
    if (this.#raw.key.fromMe) {
      return this.#bot.me.lid || this.#bot.me.pn;
    }
    const { lid, pn } = resolveLIDOrPN(this.#raw.key.participant, this.#raw.key.participantAlt);
    if (lid || pn) {
      const user = this.#bot.cache.users.get({ lid, pn });
      return user?.lid || user?.pn || lid || pn || '';
    }
    return this.chat.jid;
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
    const type = this.#getContentType(msg);
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
  /** Returns the raw WAMessage object from baileys. */
  get raw(): Readonly<WAMessage> {
    return this.#raw;
  }
  /** Returns the raw WAMessage object from baileys. */
  toRaw(): WAMessage {
    return this.#raw;
  }
  /**
   * Download the multimedia file for this message.
   * @returns A buffer containing the downloaded file.
   */
  async download() {
    const ctn = this.#raw.message ? this.#getContent(this.#raw.message) : undefined;
    if (ctn && typeof ctn !== 'string' && 'message' in ctn && ctn.message) {
      return await downloadMediaMessage({ key: this.#raw.key, message: ctn.message }, 'buffer', {});
    }
    return await downloadMediaMessage(this.#raw, 'buffer', {});
  }
  /**
   * Reply directly to this message in the same chat by quoting it automatically.
   * @param content The content of the reply message.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async reply(content: AnyMessageContent, options?: MiscMessageGenerationOptions) {
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, content, {
      ...options,
      quoted: this.#raw,
    });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /**
   * React to this message with an emoji.
   * @param emoji The emoji to react with.
   * @returns The sent message if successful, otherwise undefined.
   */
  async react(emoji: string) {
    assertType(emoji, 'emoji', 'string');
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, {
      react: { text: emoji, key: this.#raw.key },
    });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /** React to this message with a confirmation emoji (✅). */
  async reactConfirm() {
    return this.react('✅');
  }
  /** Mark this specific message as read. */
  async read() {
    await this.#bot.sock.readMessages([this.#raw.key]);
  }
  /** Delete this message from the chat for all participants. */
  async delete() {
    const msg = await this.#bot.sock.sendMessage(this.chat.jid, { delete: this.#raw.key });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /**
   * Edit the content of the current message.
   * This only works if the original message was sent by the bot.
   * @param content The new content for the message.
   * @param options Additional options for message generation.
   * @returns The edited message if successful, otherwise undefined.
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
  /**
   * Reply to this message with an external ad reply (like Baileys mods).
   * @param content The message content (text, image, etc.).
   * @param adReply The external ad reply options.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async adReply(
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
    const msg = await this.#bot.sock.sendMessage(
      this.chat.jid,
      { ...content, contextInfo } as AnyMessageContent,
      { ...options, quoted: this.#raw },
    );
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /**
   * Forward this message to another chat.
   * @param jid The JID of the destination chat.
   * @returns The forwarded message if successful, otherwise undefined.
   */
  async forward(jid: string) {
    assertType(jid, 'jid', 'string');
    const msg = await this.#bot.sock.sendMessage(jid, { forward: this.#raw });
    return msg ? new Message(msg, this.#bot) : undefined;
  }
  /**
   * Pin or unpin this message in the current chat.
   * @param pin Whether to pin (true) or unpin (false) the message.
   */
  async pin(pin = true) {
    await this.#bot.sock.chatModify({ pin }, this.chat.jid);
  }
  /**
   * Star or unstar this message.
   * @param star Whether to star (true) or unstar (false) the message.
   */
  async star(star = true) {
    await this.#bot.sock.star(this.chat.jid, [{ id: this.id, fromMe: this.sender?.isMe }], star);
  }
}
