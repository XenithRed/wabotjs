[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / BotError

# Class: BotError

Defined in: Bot.ts:56

Represents an error with a typed code.

## Extends

- `Error`

## Constructors

### Constructor

> **new BotError**(`message`, `code`, `cause?`): `BotError`

Defined in: Bot.ts:61

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `code` | [`ErrorCode`](../enumerations/ErrorCode.md) |
| `cause?` | `Error` |

#### Returns

`BotError`

#### Overrides

`Error.constructor`

## Properties

| Property | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="cause"></a> `cause?` | `Error` | The original error, if any. | `Error.cause` | Bot.ts:60 |
| <a id="code"></a> `code` | [`ErrorCode`](../enumerations/ErrorCode.md) | The error code. | - | Bot.ts:58 |
