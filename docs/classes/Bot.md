[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Bot

# Class: Bot

Defined in: [Bot.ts:74](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L74)

Core class for managing the WhatsApp bot.

## Extends

- `EventEmitter`\<[`EventMap`](../interfaces/EventMap.md)\>

## Constructors

### Constructor

> **new Bot**(`id`, `auth`): `Bot`

Defined in: [Bot.ts:101](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L101)

Creates a new instance of the Bot class.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The identifier for the bot. |
| `auth` | [`Auth`](Auth.md) | The authentication state manager. |

#### Returns

`Bot`

#### Overrides

`EventEmitter<EventMap>.constructor`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="auth"></a> `auth` | [`Auth`](Auth.md) | The authentication state manager. | [Bot.ts:84](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L84) |
| <a id="cache"></a> `cache` | `object` | Bot cache. | [Bot.ts:86](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L86) |
| `cache.flush` | () => `void` | Clear all caches. | [Bot.ts:94](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L94) |
| `cache.groups` | [`LRUCache`](LRUCache.md)\<`GroupMetadata`\> | Groups metadata cache. | [Bot.ts:90](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L90) |
| `cache.messages` | [`TTLCache`](TTLCache.md)\<`WAMessage`\> | Message cache. | [Bot.ts:92](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L92) |
| `cache.users` | [`UserCache`](UserCache.md) | User cache. | [Bot.ts:88](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L88) |

## Accessors

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [Bot.ts:331](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L331)

Gets the bot's identifier.

##### Returns

`string`

***

### me

#### Get Signature

> **get** **me**(): [`User`](../interfaces/User.md)

Defined in: [Bot.ts:349](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L349)

Gets the bot's account.

##### Returns

[`User`](../interfaces/User.md)

***

### prefix

#### Get Signature

> **get** **prefix**(): `string`

Defined in: [Bot.ts:338](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L338)

Gets the bot's command prefix.

##### Default

```ts
'/'
```

##### Returns

`string`

***

### sock

#### Get Signature

> **get** **sock**(): [`Socket`](Socket.md)

Defined in: [Bot.ts:342](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L342)

Gets the bot's socket.

##### Returns

[`Socket`](Socket.md)

## Methods

### close()

> **close**(`err?`): `Promise`\<`void`\>

Defined in: [Bot.ts:463](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L463)

Closes the bot connection without dropping the authentication state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err?` | `Error` | Optional error to provide context for the closure. |

#### Returns

`Promise`\<`void`\>

***

### login()

> **login**(`pn?`): `Promise`\<`void`\>

Defined in: [Bot.ts:370](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L370)

Log in with your existing authentication state or create a new session.
If a phone number is provided, the login method will be by pairing code (OTP), otherwise it will be by QR code.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pn?` | `string` | The phone number in E.164 format. |

#### Returns

`Promise`\<`void`\>

***

### logout()

> **logout**(`err?`): `Promise`\<`void`\>

Defined in: [Bot.ts:443](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L443)

Logs out the bot and drops the authentication state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err?` | `Error` | Optional error to provide context for the logout. |

#### Returns

`Promise`\<`void`\>

***

### setPrefix()

> **setPrefix**(`prefix`): `Bot`

Defined in: [Bot.ts:360](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Bot.ts#L360)

Sets the bot's command prefix.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prefix` | `string` | The new command prefix. |

#### Returns

`Bot`

The bot instance.
