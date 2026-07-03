[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / EventMap

# Interface: EventMap

Defined in: [Bot.ts:50](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L50)

Event map for the bot.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="close"></a> `close` | \[`Output`, `boolean`\] | **Param** **out** The disconnect output. **Param** **loggedout** If true, it means the session cannot be reconnected. | [Bot.ts:61](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L61) |
| <a id="command"></a> `command` | \[[`Message`](../classes/Message.md), `string`, `string`[]\] | **Param** **msg** The message that triggered the command. **Param** **name** The name of the command. **Param** **args** The arguments passed to the command. | [Bot.ts:71](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L71) |
| <a id="error"></a> `error` | \[`Error`\] | **Param** **err** The error that occurred. | [Bot.ts:52](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L52) |
| <a id="message"></a> `message` | \[[`Message`](../classes/Message.md)\] | **Param** **msg** The message received. | [Bot.ts:65](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L65) |
| <a id="open"></a> `open` | \[[`User`](User.md)\] | **Param** **me** The bot's account. | [Bot.ts:63](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L63) |
| <a id="otp"></a> `otp` | \[`string`\] | **Param** **code** The generated pairing code (OTP). | [Bot.ts:56](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L56) |
| <a id="qr"></a> `qr` | \[`string`\] | **Param** **str** The generated QR code. | [Bot.ts:54](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L54) |
