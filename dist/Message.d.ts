import { WAProto } from 'baileys';
import type { WAMessage, AnyMessageContent, MiscMessageGenerationOptions, WAMediaUpload } from 'baileys';
import type { Bot, User } from './Bot.js';
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
export declare class Message {
    #private;
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
    constructor(raw: WAMessage, bot: Bot);
    get mentions(): User[];
    get type(): keyof WAProto.IMessage | undefined;
    get mimetype(): string | undefined;
    get hash(): Uint8Array | undefined;
    get key(): Uint8Array | undefined;
    get url(): string | undefined;
    get path(): string | undefined;
    get size(): Long | undefined;
    get quoted(): Message | undefined;
    /** Returns the raw WAMessage object from baileys. */
    get raw(): Readonly<WAMessage>;
    /** Returns the raw WAMessage object from baileys. */
    toRaw(): WAMessage;
    /**
     * Download the multimedia file for this message.
     * @returns A buffer containing the downloaded file.
     */
    download(): Promise<Buffer<ArrayBufferLike>>;
    /**
     * Reply directly to this message in the same chat by quoting it automatically.
     * @param content The content of the reply message.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    reply(content: AnyMessageContent, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * React to this message with an emoji.
     * @param emoji The emoji to react with.
     * @returns The sent message if successful, otherwise undefined.
     */
    react(emoji: string): Promise<Message | undefined>;
    /** React to this message with a confirmation emoji (✅). */
    reactConfirm(): Promise<Message | undefined>;
    /** Mark this specific message as read. */
    read(): Promise<void>;
    /** Delete this message from the chat for all participants. */
    delete(): Promise<Message | undefined>;
    /**
     * Edit the content of the current message.
     * This only works if the original message was sent by the bot.
     * @param content The new content for the message.
     * @param options Additional options for message generation.
     * @returns The edited message if successful, otherwise undefined.
     */
    edit(content: AnyMessageContent, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Reply to this message with an external ad reply (like Baileys mods).
     * @param content The message content (text, image, etc.).
     * @param adReply The external ad reply options.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    adReply(content: AnyMessageContent, adReply: ExternalAdReplyOptions, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Reply with a product message (WhatsApp Business).
     * @param product The product options.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    productReply(product: ProductOptions, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Forward this message to another chat.
     * @param jid The JID of the destination chat.
     * @returns The forwarded message if successful, otherwise undefined.
     */
    forward(jid: string): Promise<Message | undefined>;
    /**
     * Pin or unpin this message in the current chat.
     * @param pin Whether to pin (true) or unpin (false) the message.
     */
    pin(pin?: boolean): Promise<void>;
    /**
     * Star or unstar this message.
     * @param star Whether to star (true) or unstar (false) the message.
     */
    star(star?: boolean): Promise<void>;
}
