[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Sender

# Interface: Sender

Defined in: [Message.ts:17](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L17)

Represents the sender of a message.

## Extends

- [`User`](User.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="device"></a> `device` | `"unknown"` \| `"ios"` \| `"android"` \| `"web"` \| `"desktop"` | Deduced through the message ID. | - | [Message.ts:19](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L19) |
| <a id="isme"></a> `isMe` | `boolean` | If the message was sent by the bot. | - | [Message.ts:21](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L21) |
| <a id="lid"></a> `lid` | `string` | The user's local identifier. | [`User`](User.md).[`lid`](User.md#lid) | [Bot.ts:24](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L24) |
| <a id="name"></a> `name?` | `string` | Display name | [`User`](User.md).[`name`](User.md#name) | [Bot.ts:28](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L28) |
| <a id="pn"></a> `pn` | `string` | The user's phone number. | [`User`](User.md).[`pn`](User.md#pn) | [Bot.ts:26](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L26) |
| <a id="username"></a> `username?` | `string` | Soon. | [`User`](User.md).[`username`](User.md#username) | [Bot.ts:30](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L30) |
