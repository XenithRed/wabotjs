[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Message

# Class: Message

Defined in: Message.ts:44

Represents a message in the WhatsApp.

## Constructors

### Constructor

> **new Message**(`raw`, `bot`): `Message`

Defined in: Message.ts:80

Creates a new Message instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `raw` | `WAMessage` | The raw WAMessage object from baileys. |
| `bot` | [`Bot`](Bot.md) | The bot instance that received the message. |

#### Returns

`Message`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="chat"></a> `chat` | [`Chat`](../interfaces/Chat.md) | The chat to which the message belongs. | Message.ts:50 |
| <a id="hash"></a> `hash?` | `Uint8Array`\<`ArrayBufferLike`\> | The hash of the message. | Message.ts:64 |
| <a id="id"></a> `id` | `string` | The ID of the message. | Message.ts:48 |
| <a id="key"></a> `key?` | `Uint8Array`\<`ArrayBufferLike`\> | The key of the message. | Message.ts:66 |
| <a id="mentions"></a> `mentions` | [`User`](../interfaces/User.md)[] | The users mentioned in the message. | Message.ts:56 |
| <a id="mimetype"></a> `mimetype?` | `string` | The MIME type of the message. | Message.ts:62 |
| <a id="path"></a> `path?` | `string` | The path of the message. | Message.ts:70 |
| <a id="quoted"></a> `quoted?` | `Message` | The quoted message. | Message.ts:74 |
| <a id="sender"></a> `sender?` | [`Sender`](../interfaces/Sender.md) | The sender of the message. | Message.ts:52 |
| <a id="size"></a> `size?` | `Long` | The size (bytes) of the message. | Message.ts:72 |
| <a id="text"></a> `text?` | `string` | The text content of the message. | Message.ts:54 |
| <a id="timestamp"></a> `timestamp` | `Long` | The timestamp (UNIX) of the message. | Message.ts:58 |
| <a id="type"></a> `type?` | keyof IMessage | The type of the message. | Message.ts:60 |
| <a id="url"></a> `url?` | `string` | The URL of the message. | Message.ts:68 |

## Accessors

### raw

#### Get Signature

> **get** **raw**(): `Readonly`\<`WAMessage`\>

Defined in: Message.ts:322

Returns the raw WAMessage object from baileys.

##### Returns

`Readonly`\<`WAMessage`\>

## Methods

### adReply()

> **adReply**(`content`, `adReply`, `options?`): `Promise`\<`Message` \| `undefined`\>

Defined in: Message.ts:410

Reply to this message with an external ad reply (like Baileys mods).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `AnyMessageContent` | The message content (text, image, etc.). |
| `adReply` | [`ExternalAdReplyOptions`](../interfaces/ExternalAdReplyOptions.md) | The external ad reply options. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<`Message` \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### delete()

> **delete**(): `Promise`\<`Message` \| `undefined`\>

Defined in: Message.ts:373

Delete this message from the chat for all participants.

#### Returns

`Promise`\<`Message` \| `undefined`\>

***

### download()

> **download**(): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: Message.ts:333

Download the multimedia file for this message.

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

A buffer containing the downloaded file.

***

### edit()

> **edit**(`content`, `options?`): `Promise`\<`Message` \| `undefined`\>

Defined in: Message.ts:384

Edit the content of the current message.
This only works if the original message was sent by the bot.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `AnyMessageContent` | The new content for the message. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<`Message` \| `undefined`\>

The edited message if successful, otherwise undefined.

***

### react()

> **react**(`emoji`): `Promise`\<`Message` \| `undefined`\>

Defined in: Message.ts:361

React to this message with an emoji.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `emoji` | `string` | The emoji to react with. |

#### Returns

`Promise`\<`Message` \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### read()

> **read**(): `Promise`\<`void`\>

Defined in: Message.ts:369

Mark this specific message as read.

#### Returns

`Promise`\<`void`\>

***

### reply()

> **reply**(`content`, `options?`): `Promise`\<`Message` \| `undefined`\>

Defined in: Message.ts:349

Reply directly to this message in the same chat by quoting it automatically.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `AnyMessageContent` | The content of the reply message. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<`Message` \| `undefined`\>

The sent message if successful, otherwise undefined.

***

### toRaw()

> **toRaw**(): `WAMessage`

Defined in: Message.ts:326

Returns the raw WAMessage object from baileys.

#### Returns

`WAMessage`
