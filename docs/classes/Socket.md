[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Socket

# Class: Socket

Defined in: [Socket.ts:8](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Socket.ts#L8)

## Extends

- `Omit`\<`WASocket`, `"end"` \| `"logout"` \| `"authState"`\>

## Constructors

### Constructor

> **new Socket**(`config`): `Socket`

Defined in: [Socket.ts:16](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Socket.ts#L16)

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

Defined in: [Socket.ts:22](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Socket.ts#L22)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err?` | `Error` |

#### Returns

`Promise`\<`void`\>

***

### logout()

> **logout**(`err?`): `Promise`\<`void`\>

Defined in: [Socket.ts:25](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Socket.ts#L25)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err?` | `Error` |

#### Returns

`Promise`\<`void`\>
