[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / UserCache

# Class: UserCache

Defined in: [utils/UserCache.ts:6](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L6)

An in-memory cache for users.

## Constructors

### Constructor

> **new UserCache**(): `UserCache`

Defined in: [utils/UserCache.ts:8](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L8)

#### Returns

`UserCache`

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [utils/UserCache.ts:10](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L10)

Gets the number of items in the cache.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/UserCache.ts:60](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L60)

Clears the cache.

#### Returns

`void`

***

### del()

> **del**(`user`): `boolean`

Defined in: [utils/UserCache.ts:50](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L50)

Deletes a user from the cache by LID or PN.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | `Partial`\<[`User`](../interfaces/User.md)\> | The user to delete (by LID or PN). |

#### Returns

`boolean`

True if the user was found and deleted, otherwise false.

***

### entries()

> **entries**(): \[`string`, [`User`](../interfaces/User.md)\][]

Defined in: [utils/UserCache.ts:86](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L86)

Returns an array of all entries (key-value pairs) in the cache.

#### Returns

\[`string`, [`User`](../interfaces/User.md)\][]

***

### get()

> **get**(`user`): [`User`](../interfaces/User.md) \| `undefined`

Defined in: [utils/UserCache.ts:36](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L36)

Gets a user from the cache by LID or PN.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | `Partial`\<[`User`](../interfaces/User.md)\> | The user to get (by LID or PN). |

#### Returns

[`User`](../interfaces/User.md) \| `undefined`

The user if found, otherwise undefined.

***

### has()

> **has**(`user`): `boolean`

Defined in: [utils/UserCache.ts:68](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L68)

Checks if the cache contains a user by LID or PN.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | `Partial`\<[`User`](../interfaces/User.md)\> | The user to check (by LID or PN). |

#### Returns

`boolean`

True if the user exists, otherwise false.

***

### keys()

> **keys**(): `string`[]

Defined in: [utils/UserCache.ts:78](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L78)

Returns an array of all keys in the cache.

#### Returns

`string`[]

***

### set()

> **set**(`user`): `UserCache`

Defined in: [utils/UserCache.ts:18](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L18)

Sets a user in the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | [`User`](../interfaces/User.md) | The user to set. |

#### Returns

`UserCache`

The cache instance.

***

### values()

> **values**(): [`User`](../interfaces/User.md)[]

Defined in: [utils/UserCache.ts:82](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/UserCache.ts#L82)

Returns an array of all values in the cache.

#### Returns

[`User`](../interfaces/User.md)[]
