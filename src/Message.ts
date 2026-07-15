import { downloadMediaMessage, getDevice, isJidGroup, jidNormalizedUser, WAProto } from 'baileys';
import type { WAMessage, AnyMessageContent, MiscMessageGenerationOptions, WAMediaUpload } from 'baileys';
import type { Bot, User } from './Bot.js';
import { assertType, isAnyJIDEqual, resolveLIDOrPN } from './utils/index.js';
import Long from 'long';

/** Options for sending a product message (WhatsApp Business). */
export interface ProductOptions {
  /** The product image (Buffer, Stream, URL). */
  productImage: WAMediaUpload;
  /** The product title. */
  title: string;
  /** The product description. */
  description?: string;
  /** Currency code (e.g. 'USD', 'EUR', 'COP'). */
  currencyCode?: string;
  /** Price in currency minor units (e.g. 1000 = $10.00). */
  priceAmount1000?: number;
  /** Retailer/product ID. */
  retailerId?: string;
  /** Product URL. */
  url?: string;
  /** Number of product images. */
  productImageCount?: number;
  /** First image ID. */
  firstImageId?: string;
  /** Sale price in currency minor units. */
  salePriceAmount1000?: number;
  /** Business owner JID. */
  businessOwnerJid?: string;
  /** Body text for the message. */
  body?: string;
  /** Footer text for the message. */
  footer?: string;
}
/** Options for an external ad reply. */
export interface ExternalAdReplyOptions {
  /** The title of the ad reply. */
  title: string;
  /** The body of the ad reply. */
  body?: string;
  /** The thumbnail URL of the ad reply. */
  thumbnailUrl?: string;
  /** The media type of the ad reply (1 = image, 2 = video). */
  mediaType?: number;
  /** The source URL of the ad reply. */
  sourceUrl?: string;
  /** Whether to render a larger thumbnail (banner style). */
  renderLargerThumbnail?: boolean;
  /** Whether to show ad attribution. */
  showAdAttribution?: boolean;
  /** If true, renders the thumbnail as a large banner with mediaType 1 (image). */
  banner?: boolean;
  /** Click-to-WhatsApp Ad client ID. Required for CTWA campaigns. */
  ctwaClid?: string;
  /** Ad type: 0 = CTWA (Click-to-WhatsApp), 1 = CAWC (Click-to-WhatsApp Call). */
  adType?: number;
  /** Type of the ad source (e.g. 'ctwa'). */
  sourceType?: string;
  /** ID of the ad source. */
  sourceId?: string;
  /** Source application identifier. */
  sourceApp?: string;
  /** URL of the media content (separate from thumbnailUrl). */
  mediaUrl?: string;
  /** Original full-size image URL. */
  originalImageUrl?: string;
  /** Whether this message is an auto-reply. */
  containsAutoReply?: boolean;
  /** Whether the ad triggers a WhatsApp call. */
  clickToWhatsappCall?: boolean;
  /** Content of the automated greeting message. */
  greetingMessageBody?: string;
  /** Call-to-action payload data. */
  ctaPayload?: string;
  /** Website URL for the ad. */
  wtwaWebsiteUrl?: boolean;
  /** WhatsApp-to-WhatsApp ad format flag. */
  wtwaAdFormat?: boolean;
  /** Disable follow-up nudge. */
  disableNudge?: boolean;
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
  #resolvedParticipant: { lid: string | undefined; pn: string | undefined };
  #cachedContent?: Record<string, unknown> | string;
  #cachedContentType?: keyof WAProto.IMessage;
  #contentResolved: boolean;
  #mentions?: User[];
  #quoted?: Message | null;
  #type?: keyof WAProto.IMessage;
  #mimetype?: string;
  #hash?: Uint8Array;
  #key?: Uint8Array;
  #url?: string;
  #path?: string;
  #size?: Long;
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
  /** The timestamp (UNIX) of the message. */
  timestamp: Long;
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
    this.#contentResolved = false;
    this.#resolvedParticipant = resolveLIDOrPN(raw.key.participant, raw.key.participantAlt);
    this.id = raw.key.id!;
    this.chat = this.#resolveChat();
    this.sender = this.#resolveSender();
    this.senderJid = this.#resolveSenderJid();
    this.text = this.#resolveText();
    this.timestamp = Long.fromValue(raw.messageTimestamp || Math.floor(Date.now() / 1000));
  }
  #resolveContent() {
    if (this.#contentResolved) {
      return this.#cachedContent;
    }
    this.#contentResolved = true;
    if (!this.#raw.message) {
      this.#cachedContentType = undefined;
      this.#cachedContent = undefined;
      return undefined;
    }
    const type = (Object.keys(this.#raw.message) as (keyof WAProto.IMessage)[])
      .filter((k) => k !== 'senderKeyDistributionMessage' && k !== 'messageContextInfo')
      .at(0);
    this.#cachedContentType = type;
    this.#cachedContent = type ? (this.#raw.message as Record<string, unknown>)[type as string] as Record<string, unknown> | string : undefined;
    return this.#cachedContent;
  }
  #resolveChat(): Chat {
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
  #resolveSender(): Sender | undefined {
    if (this.#raw.key.fromMe) {
      return {
        ...this.#bot.me,
        device: getDevice(this.id),
        isMe: true,
      };
    }
    const { lid, pn } = this.#resolvedParticipant;
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
  #resolveSenderJid(): string {
    if (this.#raw.key.fromMe) {
      return this.#bot.me.lid || this.#bot.me.pn;
    }
    const { lid, pn } = this.#resolvedParticipant;
    if (lid || pn) {
      const user = this.#bot.cache.users.get({ lid, pn });
      return user?.lid || user?.pn || lid || pn || '';
    }
    return this.chat.jid;
  }
  #resolveText() {
    const ctn = this.#resolveContent();
    if (!ctn) {
      return;
    }
    const val = (
      typeof ctn === 'string'
        ? ctn
        : 'text' in (ctn as Record<string, unknown>)
          ? (ctn as Record<string, unknown>).text
          : 'caption' in (ctn as Record<string, unknown>)
            ? (ctn as Record<string, unknown>).caption
            : 'selectedButtonId' in (ctn as Record<string, unknown>)
              ? (ctn as Record<string, unknown>).selectedButtonId
              : undefined
    );
    return typeof val === 'string' ? val.trim() : undefined;
  }
  get mentions(): User[] {
    if (this.#mentions) {
      return this.#mentions;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      return (this.#mentions = []);
    }
    const mentions = new Set<User>();
    const c = ctn as Record<string, unknown>;
    if ('contextInfo' in c && Array.isArray((c.contextInfo as Record<string, unknown>)?.mentionedJid)) {
      ((c.contextInfo as Record<string, unknown>).mentionedJid as string[]).forEach((m: string) => {
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
    this.#mentions = mentions.values().toArray();
    return this.#mentions;
  }
  get type(): keyof WAProto.IMessage | undefined {
    if (this.#type) {
      return this.#type;
    }
    if (this.#raw.message) {
      const ctn = this.#resolveContent();
      if (ctn && typeof ctn === 'object' && 'message' in (ctn as Record<string, unknown>)) {
        return this.#resolveNestedType((ctn as Record<string, unknown>).message as Record<string, unknown>);
      }
    }
    this.#type = this.#cachedContentType;
    return this.#type;
  }
  #resolveNestedType(msg: Record<string, unknown>): keyof WAProto.IMessage | undefined {
    const type = (Object.keys(msg) as (keyof WAProto.IMessage)[])
      .filter((k) => k !== 'senderKeyDistributionMessage' && k !== 'messageContextInfo')
      .at(0);
    const ctn = type ? msg[type as string] : undefined;
    if (typeof ctn === 'object' && ctn && 'message' in (ctn as Record<string, unknown>)) {
      return this.#resolveNestedType((ctn as Record<string, unknown>).message as Record<string, unknown>);
    }
    return type;
  }
  get mimetype(): string | undefined {
    if (this.#mimetype !== undefined) {
      return this.#mimetype;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      return (this.#mimetype = undefined);
    }
    const c = ctn as Record<string, unknown>;
    if ('mimetype' in c && typeof c.mimetype === 'string') {
      return (this.#mimetype = c.mimetype);
    }
    if ('message' in c && typeof c.message === 'object' && c.message) {
      return (this.#mimetype = this.#resolveNestedMIMEType(c.message as Record<string, unknown>));
    }
    return (this.#mimetype = undefined);
  }
  #resolveNestedMIMEType(msg: Record<string, unknown>): string | undefined {
    if ('mimetype' in msg && typeof msg.mimetype === 'string') {
      return msg.mimetype;
    }
    if ('message' in msg && typeof msg.message === 'object' && msg.message) {
      return this.#resolveNestedMIMEType(msg.message as Record<string, unknown>);
    }
  }
  get hash(): Uint8Array | undefined {
    if (this.#hash !== undefined) {
      return this.#hash;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      return (this.#hash = undefined);
    }
    if ('fileSha256' in ctn && ctn.fileSha256) {
      if (ctn.fileSha256 instanceof Buffer) {
        return (this.#hash = new Uint8Array(ctn.fileSha256));
      }
      return (this.#hash = ctn.fileSha256 as Uint8Array);
    }
    return (this.#hash = undefined);
  }
  get key(): Uint8Array | undefined {
    if (this.#key !== undefined) {
      return this.#key;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      return (this.#key = undefined);
    }
    if ('mediaKey' in ctn && ctn.mediaKey) {
      if (ctn.mediaKey instanceof Buffer) {
        return (this.#key = new Uint8Array(ctn.mediaKey));
      }
      return (this.#key = ctn.mediaKey as Uint8Array);
    }
    return (this.#key = undefined);
  }
  get url(): string | undefined {
    if (this.#url !== undefined) {
      return this.#url;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      return (this.#url = undefined);
    }
    if ('url' in ctn && typeof ctn.url === 'string') {
      return (this.#url = new URL(ctn.url).href);
    }
    return (this.#url = undefined);
  }
  get path(): string | undefined {
    if (this.#path !== undefined) {
      return this.#path;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      return (this.#path = undefined);
    }
    if ('directPath' in ctn && typeof ctn.directPath === 'string') {
      return (this.#path = ctn.directPath);
    }
    return (this.#path = undefined);
  }
  get size(): Long | undefined {
    if (this.#size !== undefined) {
      return this.#size;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      return (this.#size = undefined);
    }
    if ('fileLength' in ctn && ctn.fileLength) {
      return (this.#size = Long.fromValue(ctn.fileLength as Long | number));
    }
    return (this.#size = undefined);
  }
  get quoted(): Message | undefined {
    if (this.#quoted !== null && this.#quoted !== undefined) {
      return this.#quoted;
    }
    if (this.#quoted === null) {
      return undefined;
    }
    const ctn = this.#resolveContent();
    if (!ctn || typeof ctn === 'string') {
      this.#quoted = null;
      return undefined;
    }
    const c = ctn as Record<string, unknown>;
    const ctxInfo = 'contextInfo' in c ? (c.contextInfo as Record<string, unknown>) : undefined;
    if (ctxInfo && 'quotedMessage' in ctxInfo) {
      const fromMe = ctxInfo.participant
        ? isAnyJIDEqual(ctxInfo.participant as string, this.#bot.me.lid, this.#bot.me.pn)
        : false;
      const msg = {
        key: {
          remoteJid: (ctxInfo.remoteJid as string) || this.chat.jid,
          participant: fromMe ? this.#bot.me.lid : (ctxInfo.participant as string),
          id: ctxInfo.stanzaId as string,
          fromMe,
        },
        message: ctxInfo.quotedMessage,
      };
      this.#quoted = new Message(msg as WAMessage, this.#bot);
      return this.#quoted;
    }
    this.#quoted = null;
    return undefined;
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
    const ctn = this.#resolveContent();
    if (ctn && typeof ctn !== 'string' && 'message' in (ctn as Record<string, unknown>)) {
      const inner = (ctn as Record<string, unknown>).message;
      if (inner) {
        return await downloadMediaMessage({ key: this.#raw.key, message: inner }, 'buffer', {});
      }
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
        ctwaClid: adReply.ctwaClid,
        adType: adReply.adType,
        sourceType: adReply.sourceType,
        sourceId: adReply.sourceId,
        sourceApp: adReply.sourceApp,
        mediaUrl: adReply.mediaUrl,
        originalImageUrl: adReply.originalImageUrl,
        containsAutoReply: adReply.containsAutoReply,
        clickToWhatsappCall: adReply.clickToWhatsappCall,
        greetingMessageBody: adReply.greetingMessageBody,
        ctaPayload: adReply.ctaPayload,
        wtwaWebsiteUrl: adReply.wtwaWebsiteUrl,
        wtwaAdFormat: adReply.wtwaAdFormat,
        disableNudge: adReply.disableNudge,
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
   * Reply with a product message (WhatsApp Business).
   * @param product The product options.
   * @param options Additional options for message generation.
   * @returns The sent message if successful, otherwise undefined.
   */
  async productReply(product: ProductOptions, options?: MiscMessageGenerationOptions) {
    const msg = await this.#bot.sock.sendMessage(
      this.chat.jid,
      {
        product: {
          productImage: product.productImage,
          title: product.title,
          description: product.description,
          currencyCode: product.currencyCode,
          priceAmount1000: product.priceAmount1000,
          retailerId: product.retailerId,
          url: product.url,
          productImageCount: product.productImageCount,
          firstImageId: product.firstImageId,
          salePriceAmount1000: product.salePriceAmount1000,
        },
        businessOwnerJid: product.businessOwnerJid,
        body: product.body,
        footer: product.footer,
      },
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
