[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Bot

# Class: Bot

Defined in: Bot.ts:110

Core class for managing the WhatsApp bot.

## Extends

- `EventEmitter`\<[`EventMap`](../interfaces/EventMap.md)\>

## Constructors

### Constructor

> **new Bot**(`id`, `auth`): `Bot`

Defined in: Bot.ts:137

Creates a new instance of the Bot class.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The identifier for the bot. |
| `auth` | [`Auth`](Auth.md) | The authentication state manager. |

#### Returns

`Bot`

#### Overrides

`EventEmitter<EventMap>.constructor`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="auth"></a> `auth` | [`Auth`](Auth.md) | The authentication state manager. | Bot.ts:120 |
| <a id="cache"></a> `cache` | `object` | Bot cache. | Bot.ts:122 |
| `cache.flush` | () => `void` | Clear all caches. | Bot.ts:130 |
| `cache.groups` | [`LRUCache`](LRUCache.md)\<`GroupMetadata`\> | Groups metadata cache. | Bot.ts:126 |
| `cache.messages` | [`TTLCache`](TTLCache.md)\<`WAMessage`\> | Message cache. | Bot.ts:128 |
| `cache.users` | [`UserCache`](UserCache.md) | User cache. | Bot.ts:124 |

## Accessors

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: Bot.ts:367

Gets the bot's identifier.

##### Returns

`string`

***

### me

#### Get Signature

> **get** **me**(): [`User`](../interfaces/User.md)

Defined in: Bot.ts:385

Gets the bot's account.

##### Returns

[`User`](../interfaces/User.md)

***

### prefix

#### Get Signature

> **get** **prefix**(): `string`

Defined in: Bot.ts:374

Gets the bot's command prefix.

##### Default

```ts
'/'
```

##### Returns

`string`

***

### sock

#### Get Signature

> **get** **sock**(): [`Socket`](Socket.md)

Defined in: Bot.ts:378

Gets the bot's socket.

##### Returns

[`Socket`](Socket.md)

## Methods

### close()

> **close**(`err?`): `Promise`\<`void`\>

Defined in: Bot.ts:499

Closes the bot connection without dropping the authentication state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err?` | `Error` | Optional error to provide context for the closure. |

#### Returns

`Promise`\<`void`\>

***

### getProfilePicture()

> **getProfilePicture**(`jid`, `type?`): `Promise`\<`string` \| `undefined`\>

Defined in: Bot.ts:641

Get the profile picture URL of a JID with caching.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `jid` | `string` | `undefined` | The JID to get the profile picture for. |
| `type` | `"image"` \| `"preview"` | `'image'` | The type of picture to fetch ('image' or 'preview'). |

#### Returns

`Promise`\<`string` \| `undefined`\>

The profile picture URL, or undefined if not found.

***

### login()

> **login**(`pn?`): `Promise`\<`void`\>

Defined in: Bot.ts:406

Log in with your existing authentication state or create a new session.
If a phone number is provided, the login method will be by pairing code (OTP), otherwise it will be by QR code.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pn?` | `string` | The phone number in E.164 format. |

#### Returns

`Promise`\<`void`\>

***

### logout()

> **logout**(`err?`): `Promise`\<`void`\>

Defined in: Bot.ts:479

Logs out the bot and drops the authentication state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err?` | `Error` | Optional error to provide context for the logout. |

#### Returns

`Promise`\<`void`\>

***

### send()

> **send**(`jid`, `content`, `options?`): `Promise`\<[`Message`](Message.md) \| `undefined`\>

Defined in: Bot.ts:523

Send a message to any JID.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jid` | `string` | The destination JID. |
| `content` | `AnyMessageContent` | The message content. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<[`Message`](Message.md) \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### sendAdReply()

> **sendAdReply**(`jid`, `content`, `adReply`, `options?`): `Promise`\<[`Message`](Message.md) \| `undefined`\>

Defined in: Bot.ts:535

Send a message with an external ad reply.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jid` | `string` | The destination JID. |
| `content` | `AnyMessageContent` | The message content. |
| `adReply` | [`ExternalAdReplyOptions`](../interfaces/ExternalAdReplyOptions.md) | The external ad reply options. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<[`Message`](Message.md) \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### sendAudio()

> **sendAudio**(`jid`, `media`, `ptt?`, `options?`): `Promise`\<[`Message`](Message.md) \| `undefined`\>

Defined in: Bot.ts:601

Send an audio to a chat.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `jid` | `string` | `undefined` | The destination JID. |
| `media` | `WAMediaUpload` | `undefined` | The audio (Buffer, Stream, URL). |
| `ptt` | `boolean` | `false` | Whether to send as voice note (PTT). Defaults to false. |
| `options?` | `MiscMessageGenerationOptions` | `undefined` | Additional options for message generation. |

#### Returns

`Promise`\<[`Message`](Message.md) \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### sendDocument()

> **sendDocument**(`jid`, `media`, `mimetype`, `fileName`, `options?`): `Promise`\<[`Message`](Message.md) \| `undefined`\>

Defined in: Bot.ts:614

Send a document to a chat.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jid` | `string` | The destination JID. |
| `media` | `WAMediaUpload` | The document (Buffer, Stream, URL). |
| `mimetype` | `string` | The MIME type of the document. |
| `fileName` | `string` | The file name to display. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<[`Message`](Message.md) \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### sendImage()

> **sendImage**(`jid`, `media`, `caption?`, `options?`): `Promise`\<[`Message`](Message.md) \| `undefined`\>

Defined in: Bot.ts:577

Send an image to a chat.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jid` | `string` | The destination JID. |
| `media` | `WAMediaUpload` | The image (Buffer, Stream, URL). |
| `caption?` | `string` | Optional caption for the image. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<[`Message`](Message.md) \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### sendSticker()

> **sendSticker**(`jid`, `media`, `options?`): `Promise`\<[`Message`](Message.md) \| `undefined`\>

Defined in: Bot.ts:631

Send a sticker to a chat.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jid` | `string` | The destination JID. |
| `media` | `WAMediaUpload` | The sticker (Buffer, Stream, URL). |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<[`Message`](Message.md) \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### sendVideo()

> **sendVideo**(`jid`, `media`, `caption?`, `options?`): `Promise`\<[`Message`](Message.md) \| `undefined`\>

Defined in: Bot.ts:589

Send a video to a chat.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jid` | `string` | The destination JID. |
| `media` | `WAMediaUpload` | The video (Buffer, Stream, URL). |
| `caption?` | `string` | Optional caption for the video. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<[`Message`](Message.md) \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### setPrefix()

> **setPrefix**(`prefix`): `Bot`

Defined in: Bot.ts:396

Sets the bot's command prefix.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prefix` | `string` | The new command prefix. |

#### Returns

`Bot`

The bot instance.
