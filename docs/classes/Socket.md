[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Socket

# Class: Socket

Defined in: Socket.ts:8

## Extends

- `Omit`\<`WASocket`, `"end"` \| `"logout"` \| `"authState"`\>

## Constructors

### Constructor

> **new Socket**(`config`): `Socket`

Defined in: Socket.ts:16

Creates a new Socket instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | `UserFacingSocketConfig` | The configuration for the socket. |

#### Returns

`Socket`

#### Inherited from

Omit\<WASocket, 'end' \| 'logout' \| 'authState'\>.constructor

## Methods

### end()

> **end**(`err?`): `Promise`\<`void`\>

Defined in: Socket.ts:22

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err?` | `Error` |

#### Returns

`Promise`\<`void`\>

***

### logout()

> **logout**(`err?`): `Promise`\<`void`\>

Defined in: Socket.ts:25

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err?` | `Error` |

#### Returns

`Promise`\<`void`\>
