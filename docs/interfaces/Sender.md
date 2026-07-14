[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Sender

# Interface: Sender

Defined in: Message.ts:37

Represents the sender of a message.

## Extends

- [`User`](User.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="device"></a> `device` | `"unknown"` \| `"ios"` \| `"android"` \| `"web"` \| `"desktop"` | Deduced through the message ID. | - | Message.ts:39 |
| <a id="isme"></a> `isMe` | `boolean` | If the message was sent by the bot. | - | Message.ts:41 |
| <a id="lid"></a> `lid` | `string` | The user's local identifier. | [`User`](User.md).[`lid`](User.md#lid) | Bot.ts:26 |
| <a id="name"></a> `name?` | `string` | Display name | [`User`](User.md).[`name`](User.md#name) | Bot.ts:30 |
| <a id="pn"></a> `pn` | `string` | The user's phone number. | [`User`](User.md).[`pn`](User.md#pn) | Bot.ts:28 |
| <a id="username"></a> `username?` | `string` | Soon. | [`User`](User.md).[`username`](User.md#username) | Bot.ts:32 |
