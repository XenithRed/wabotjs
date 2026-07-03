[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Chat

# Interface: Chat

Defined in: [Message.ts:8](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L8)

Represents a chat in the WhatsApp.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="jid"></a> `jid` | `string` | The chat JID. | [Message.ts:10](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L10) |
| <a id="name"></a> `name?` | `string` | Display name. | [Message.ts:12](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L12) |
| <a id="type"></a> `type` | `"private"` \| `"group"` \| `"community"` \| `"unknown"` | Deduced through the chat JID. | [Message.ts:14](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Message.ts#L14) |
