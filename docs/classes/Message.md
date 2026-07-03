[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Message

# Class: Message

Defined in: [Message.ts:24](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L24)

Represents a message in the WhatsApp.

## Constructors

### Constructor

> **new Message**(`raw`, `bot`): `Message`

Defined in: [Message.ts:60](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L60)

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
| <a id="chat"></a> `chat` | [`Chat`](../interfaces/Chat.md) | The chat to which the message belongs. | [Message.ts:30](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L30) |
| <a id="hash"></a> `hash?` | `Uint8Array`\<`ArrayBufferLike`\> | The hash of the message. | [Message.ts:44](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L44) |
| <a id="id"></a> `id` | `string` | The ID of the message. | [Message.ts:28](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L28) |
| <a id="key"></a> `key?` | `Uint8Array`\<`ArrayBufferLike`\> | The key of the message. | [Message.ts:46](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L46) |
| <a id="mentions"></a> `mentions` | [`User`](../interfaces/User.md)[] | The users mentioned in the message. | [Message.ts:36](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L36) |
| <a id="mimetype"></a> `mimetype?` | `string` | The MIME type of the message. | [Message.ts:42](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L42) |
| <a id="path"></a> `path?` | `string` | The path of the message. | [Message.ts:50](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L50) |
| <a id="quoted"></a> `quoted?` | `Message` | The quoted message. | [Message.ts:54](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L54) |
| <a id="sender"></a> `sender?` | [`Sender`](../interfaces/Sender.md) | The sender of the message. | [Message.ts:32](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L32) |
| <a id="size"></a> `size?` | `Long` | The size (bytes) of the message. | [Message.ts:52](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L52) |
| <a id="text"></a> `text?` | `string` | The text content of the message. | [Message.ts:34](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L34) |
| <a id="timestamp"></a> `timestamp` | `Long` | The timestamp (UNIX) of the message. | [Message.ts:38](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L38) |
| <a id="type"></a> `type?` | keyof IMessage | The type of the message. | [Message.ts:40](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L40) |
| <a id="url"></a> `url?` | `string` | The URL of the message. | [Message.ts:48](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L48) |

## Accessors

### raw

#### Get Signature

> **get** **raw**(): `Readonly`\<`WAMessage`\>

Defined in: [Message.ts:302](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L302)

Returns the raw WAMessage object from baileys.

##### Returns

`Readonly`\<`WAMessage`\>

## Methods

### delete()

> **delete**(): `Promise`\<`Message` \| `undefined`\>

Defined in: [Message.ts:349](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L349)

Delete this message from the chat for all participants.

#### Returns

`Promise`\<`Message` \| `undefined`\>

***

### download()

> **download**(): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [Message.ts:309](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L309)

Download the multimedia file for this message.

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

A buffer containing the downloaded file.

***

### edit()

> **edit**(`content`, `options?`): `Promise`\<`Message` \| `undefined`\>

Defined in: [Message.ts:360](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L360)

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

Defined in: [Message.ts:337](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L337)

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

Defined in: [Message.ts:345](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L345)

Mark this specific message as read.

#### Returns

`Promise`\<`void`\>

***

### reply()

> **reply**(`content`, `options?`): `Promise`\<`Message` \| `undefined`\>

Defined in: [Message.ts:325](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L325)

Reply directly to this message in the same chat by quoting it automatically.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `AnyMessageContent` | The content of the reply message. |
| `options?` | `MiscMessageGenerationOptions` | Additional options for message generation. |

#### Returns

`Promise`\<`Message` \| `undefined`\>

The sent message if successful, otherwise undefined.
