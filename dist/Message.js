import { downloadMediaMessage, getDevice, isJidGroup, jidNormalizedUser, WAProto } from 'baileys';
import { assertType, isAnyJIDEqual, resolveLIDOrPN } from './utils/index.js';
import Long from 'long';
/** Represents a message in the WhatsApp. */
export class Message {
    #raw;
    #bot;
    #resolvedParticipant;
    #cachedContent;
    #cachedContentType;
    #contentResolved;
    #mentions;
    #quoted;
    #type;
    #mimetype;
    #hash;
    #key;
    #url;
    #path;
    #size;
    /** The ID of the message. */
    id;
    /** The chat to which the message belongs. */
    chat;
    /** The sender of the message. */
    sender;
    /** The sender JID as a plain string for quick comparisons. */
    senderJid;
    /** The text content of the message. */
    text;
    /** The timestamp (UNIX) of the message. */
    timestamp;
    /**
     * Creates a new Message instance.
     * @param raw The raw WAMessage object from baileys.
     * @param bot The bot instance that received the message.
     */
    constructor(raw, bot) {
        assertType(raw.key.id, 'raw.key.id', 'string');
        assertType(raw.key.remoteJid, 'raw.key.remoteJid', 'string');
        this.#raw = raw;
        this.#bot = bot;
        this.#contentResolved = false;
        this.#resolvedParticipant = resolveLIDOrPN(raw.key.participant, raw.key.participantAlt);
        this.id = raw.key.id;
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
        const type = Object.keys(this.#raw.message)
            .filter((k) => k !== 'senderKeyDistributionMessage' && k !== 'messageContextInfo')
            .at(0);
        this.#cachedContentType = type;
        this.#cachedContent = type ? this.#raw.message[type] : undefined;
        return this.#cachedContent;
    }
    #resolveChat() {
        if (isJidGroup(this.#raw.key.remoteJid)) {
            const jid = this.#raw.key.remoteJid;
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
                jid: (user?.lid || lid || pn),
                name: user?.name,
                type: 'private',
            };
        }
        return {
            jid: jidNormalizedUser(this.#raw.key.remoteJid),
            name: undefined,
            type: 'unknown',
        };
    }
    #resolveSender() {
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
    #resolveSenderJid() {
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
        const val = (typeof ctn === 'string'
            ? ctn
            : 'text' in ctn
                ? ctn.text
                : 'caption' in ctn
                    ? ctn.caption
                    : 'selectedButtonId' in ctn
                        ? ctn.selectedButtonId
                        : undefined);
        return typeof val === 'string' ? val.trim() : undefined;
    }
    get mentions() {
        if (this.#mentions) {
            return this.#mentions;
        }
        const ctn = this.#resolveContent();
        if (!ctn || typeof ctn === 'string') {
            return (this.#mentions = []);
        }
        const mentions = new Set();
        const c = ctn;
        if ('contextInfo' in c && Array.isArray(c.contextInfo?.mentionedJid)) {
            c.contextInfo.mentionedJid.forEach((m) => {
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
    get type() {
        if (this.#type) {
            return this.#type;
        }
        if (this.#raw.message) {
            const ctn = this.#resolveContent();
            if (ctn && typeof ctn === 'object' && 'message' in ctn) {
                return this.#resolveNestedType(ctn.message);
            }
        }
        this.#type = this.#cachedContentType;
        return this.#type;
    }
    #resolveNestedType(msg) {
        const type = Object.keys(msg)
            .filter((k) => k !== 'senderKeyDistributionMessage' && k !== 'messageContextInfo')
            .at(0);
        const ctn = type ? msg[type] : undefined;
        if (typeof ctn === 'object' && ctn && 'message' in ctn) {
            return this.#resolveNestedType(ctn.message);
        }
        return type;
    }
    get mimetype() {
        if (this.#mimetype !== undefined) {
            return this.#mimetype;
        }
        const ctn = this.#resolveContent();
        if (!ctn || typeof ctn === 'string') {
            return (this.#mimetype = undefined);
        }
        const c = ctn;
        if ('mimetype' in c && typeof c.mimetype === 'string') {
            return (this.#mimetype = c.mimetype);
        }
        if ('message' in c && typeof c.message === 'object' && c.message) {
            return (this.#mimetype = this.#resolveNestedMIMEType(c.message));
        }
        return (this.#mimetype = undefined);
    }
    #resolveNestedMIMEType(msg) {
        if ('mimetype' in msg && typeof msg.mimetype === 'string') {
            return msg.mimetype;
        }
        if ('message' in msg && typeof msg.message === 'object' && msg.message) {
            return this.#resolveNestedMIMEType(msg.message);
        }
    }
    get hash() {
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
            return (this.#hash = ctn.fileSha256);
        }
        return (this.#hash = undefined);
    }
    get key() {
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
            return (this.#key = ctn.mediaKey);
        }
        return (this.#key = undefined);
    }
    get url() {
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
    get path() {
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
    get size() {
        if (this.#size !== undefined) {
            return this.#size;
        }
        const ctn = this.#resolveContent();
        if (!ctn || typeof ctn === 'string') {
            return (this.#size = undefined);
        }
        if ('fileLength' in ctn && ctn.fileLength) {
            return (this.#size = Long.fromValue(ctn.fileLength));
        }
        return (this.#size = undefined);
    }
    get quoted() {
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
        const c = ctn;
        const ctxInfo = 'contextInfo' in c ? c.contextInfo : undefined;
        if (ctxInfo && 'quotedMessage' in ctxInfo) {
            const fromMe = ctxInfo.participant
                ? isAnyJIDEqual(ctxInfo.participant, this.#bot.me.lid, this.#bot.me.pn)
                : false;
            const msg = {
                key: {
                    remoteJid: ctxInfo.remoteJid || this.chat.jid,
                    participant: fromMe ? this.#bot.me.lid : ctxInfo.participant,
                    id: ctxInfo.stanzaId,
                    fromMe,
                },
                message: ctxInfo.quotedMessage,
            };
            this.#quoted = new Message(msg, this.#bot);
            return this.#quoted;
        }
        this.#quoted = null;
        return undefined;
    }
    /** Returns the raw WAMessage object from baileys. */
    get raw() {
        return this.#raw;
    }
    /** Returns the raw WAMessage object from baileys. */
    toRaw() {
        return this.#raw;
    }
    /**
     * Download the multimedia file for this message.
     * @returns A buffer containing the downloaded file.
     */
    async download() {
        const ctn = this.#resolveContent();
        if (ctn && typeof ctn !== 'string' && 'message' in ctn) {
            const inner = ctn.message;
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
    async reply(content, options) {
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
    async react(emoji) {
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
    async edit(content, options) {
        if (!this.sender?.isMe) {
            throw new Error(`the message with id ${this.id} cannot be edited because it was not sent by the bot`);
        }
        const msg = await this.#bot.sock.sendMessage(this.chat.jid, {
            ...content,
            edit: this.#raw.key,
        }, {
            ...options,
            quoted: this.#raw,
        });
        return msg ? new Message(msg, this.#bot) : undefined;
    }
    /**
     * Reply to this message with an external ad reply (like Baileys mods).
     * @param content The message content (text, image, etc.).
     * @param adReply The external ad reply options.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    async adReply(content, adReply, options) {
        let thumbnail;
        if (adReply.thumbnailUrl) {
            try {
                const res = await fetch(adReply.thumbnailUrl);
                const buf = Buffer.from(await res.arrayBuffer());
                thumbnail = new Uint8Array(buf);
            }
            catch { }
        }
        const contextInfo = {
            ...content?.contextInfo,
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
        const msg = await this.#bot.sock.sendMessage(this.chat.jid, { ...content, contextInfo }, { ...options, quoted: this.#raw });
        return msg ? new Message(msg, this.#bot) : undefined;
    }
    /**
     * Reply with a product message (WhatsApp Business).
     * @param product The product options.
     * @param options Additional options for message generation.
     * @returns The sent message if successful, otherwise undefined.
     */
    async productReply(product, options) {
        const msg = await this.#bot.sock.sendMessage(this.chat.jid, {
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
        }, { ...options, quoted: this.#raw });
        return msg ? new Message(msg, this.#bot) : undefined;
    }
    /**
     * Forward this message to another chat.
     * @param jid The JID of the destination chat.
     * @returns The forwarded message if successful, otherwise undefined.
     */
    async forward(jid) {
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
