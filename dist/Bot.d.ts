import { UserCache, LRUCache, TTLCache } from './utils/index.js';
import type { Output } from '@hapi/boom';
import type { GroupMetadata, WAMessage } from 'baileys';
import type { AnyMessageContent, MiscMessageGenerationOptions, WAMediaUpload } from 'baileys';
import { EventEmitter } from 'node:events';
import { Message } from './Message.js';
import type { ExternalAdReplyOptions, ProductOptions } from './Message.js';
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
export declare enum ErrorCode {
    /** An unknown error occurred. */
    UNKNOWN = "UNKNOWN",
    /** The socket connection failed. */
    SOCKET = "SOCKET",
    /** The authentication state failed to load or save. */
    AUTH = "AUTH",
    /** The pairing code request failed. */
    PAIRING = "PAIRING",
    /** The QR code generation failed. */
    QR = "QR",
    /** A message operation failed. */
    MESSAGE = "MESSAGE",
    /** A group operation failed. */
    GROUP = "GROUP",
    /** The login process failed. */
    LOGIN = "LOGIN",
    /** The logout process failed. */
    LOGOUT = "LOGOUT"
}
/** Represents an error with a typed code. */
export declare class BotError extends Error {
    /** The error code. */
    code: ErrorCode;
    /** The original error, if any. */
    cause?: Error;
    constructor(message: string, code: ErrorCode, cause?: Error);
}
/** Event names for the bot. */
export declare enum Events {
    /** Event triggered when an error occurs. */
    ERROR = "error",
    /** Event triggered when a QR code is generated. */
    QR = "qr",
    /** Event triggered when a pairing code (OTP) is generated. */
    OTP = "otp",
    /** Event triggered when the connection is closed. */
    CLOSE = "close",
    /** Event triggered when the connection is opened. */
    OPEN = "open",
    /** Event triggered when a message is received. */
    MESSAGE = "message",
    /** Event triggered when a command is received. */
    COMMAND = "command"
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
export declare class Bot extends EventEmitter<EventMap> {
    #private;
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
    constructor(id: string, auth: Auth);
    /** Gets the bot's identifier. */
    get id(): string;
    /**
     * Gets the bot's command prefix.
     * @default '/'
     */
    get prefix(): string;
    /** Gets the bot's socket. */
    get sock(): Socket;
    /** Gets the bot's account. */
    get me(): User;
    /**
     * Sets the bot's command prefix.
     * @param prefix The new command prefix.
     * @returns The bot instance.
     */
    setPrefix(prefix: string): this;
    /**
     * Log in with your existing authentication state or create a new session.
     * If a phone number is provided, the login method will be by pairing code (OTP), otherwise it will be by QR code.
     * @param pn The phone number in E.164 format.
     */
    login(pn?: string): Promise<void>;
    /**
     * Logs out the bot and drops the authentication state.
     * @param err Optional error to provide context for the logout.
     */
    logout(err?: Error): Promise<void>;
    /**
     * Closes the bot connection without dropping the authentication state.
     * @param err Optional error to provide context for the closure.
     */
    close(err?: Error): Promise<void>;
    /**
     * Send a message to any JID.
     * @param jid The destination JID.
     * @param content The message content.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    send(jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Send a message with an external ad reply.
     * @param jid The destination JID.
     * @param content The message content.
     * @param adReply The external ad reply options.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    sendAdReply(jid: string, content: AnyMessageContent, adReply: ExternalAdReplyOptions, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Send a product message (WhatsApp Business).
     * @param jid The destination JID.
     * @param product The product options.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    sendProduct(jid: string, product: ProductOptions, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Send an image to a chat.
     * @param jid The destination JID.
     * @param media The image (Buffer, Stream, URL).
     * @param caption Optional caption for the image.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    sendImage(jid: string, media: WAMediaUpload, caption?: string, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Send a video to a chat.
     * @param jid The destination JID.
     * @param media The video (Buffer, Stream, URL).
     * @param caption Optional caption for the video.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    sendVideo(jid: string, media: WAMediaUpload, caption?: string, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Send an audio to a chat.
     * @param jid The destination JID.
     * @param media The audio (Buffer, Stream, URL).
     * @param ptt Whether to send as voice note (PTT). Defaults to false.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    sendAudio(jid: string, media: WAMediaUpload, ptt?: boolean, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Send a document to a chat.
     * @param jid The destination JID.
     * @param media The document (Buffer, Stream, URL).
     * @param mimetype The MIME type of the document.
     * @param fileName The file name to display.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    sendDocument(jid: string, media: WAMediaUpload, mimetype: string, fileName: string, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Send a sticker to a chat.
     * @param jid The destination JID.
     * @param media The sticker (Buffer, Stream, URL).
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    sendSticker(jid: string, media: WAMediaUpload, options?: MiscMessageGenerationOptions): Promise<Message | undefined>;
    /**
     * Get the profile picture URL of a JID with caching.
     * @param jid The JID to get the profile picture for.
     * @param type The type of picture to fetch ('image' or 'preview').
     * @returns The profile picture URL, or undefined if not found.
     */
    getProfilePicture(jid: string, type?: 'image' | 'preview'): Promise<string | undefined>;
}
