[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / EventMap

# Interface: EventMap

Defined in: Bot.ts:86

Event map for the bot.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="close"></a> `close` | \[`Output`, `boolean`\] | **Param** **out** The disconnect output. **Param** **loggedout** If true, it means the session cannot be reconnected. | Bot.ts:97 |
| <a id="command"></a> `command` | \[[`Message`](../classes/Message.md), `string`, `string`[]\] | **Param** **msg** The message that triggered the command. **Param** **name** The name of the command. **Param** **args** The arguments passed to the command. | Bot.ts:107 |
| <a id="error"></a> `error` | \[`Error`\] | **Param** **err** The error that occurred. | Bot.ts:88 |
| <a id="message"></a> `message` | \[[`Message`](../classes/Message.md)\] | **Param** **msg** The message received. | Bot.ts:101 |
| <a id="open"></a> `open` | \[[`User`](User.md)\] | **Param** **me** The bot's account. | Bot.ts:99 |
| <a id="otp"></a> `otp` | \[`string`\] | **Param** **code** The generated pairing code (OTP). | Bot.ts:92 |
| <a id="qr"></a> `qr` | \[`string`\] | **Param** **str** The generated QR code. | Bot.ts:90 |
