[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / TTLCache

# Class: TTLCache\<V\>

Defined in: [utils/TTLCache.ts:8](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L8)

A simple Time to Live (TTL) cache implementation.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `V` | The type of values stored in the cache. |

## Constructors

### Constructor

> **new TTLCache**\<`V`\>(`ttl`): `TTLCache`\<`V`\>

Defined in: [utils/TTLCache.ts:16](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L16)

Creates a new TTLCache instance with the specified time to live (TTL) in milliseconds.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ttl` | `number` | The time to live for each item in the cache. |

#### Returns

`TTLCache`\<`V`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [utils/TTLCache.ts:48](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L48)

Gets the number of items in the cache.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/TTLCache.ts:85](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L85)

Clears the cache.

#### Returns

`void`

***

### del()

> **del**(`key`): `boolean`

Defined in: [utils/TTLCache.ts:80](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L80)

Deletes a value from the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value to delete. |

#### Returns

`boolean`

True if the value was found and deleted, otherwise false.

***

### entries()

> **entries**(): \[`string`, `V`\][]

Defined in: [utils/TTLCache.ts:109](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L109)

Returns an array of all entries (key-value pairs) in the cache.

#### Returns

\[`string`, `V`\][]

***

### get()

> **get**(`key`): `V` \| `undefined`

Defined in: [utils/TTLCache.ts:69](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L69)

Gets a value from the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value. |

#### Returns

`V` \| `undefined`

The value if found, otherwise undefined.

***

### has()

> **has**(`key`): `boolean`

Defined in: [utils/TTLCache.ts:94](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L94)

Checks if the cache contains a value for the given key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key to check. |

#### Returns

`boolean`

True if the value exists, otherwise false.

***

### keys()

> **keys**(): `string`[]

Defined in: [utils/TTLCache.ts:101](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L101)

Returns an array of all keys in the cache.

#### Returns

`string`[]

***

### set()

> **set**(`key`, `value`): `TTLCache`\<`V`\>

Defined in: [utils/TTLCache.ts:57](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L57)

Sets a value in the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value. |
| `value` | `V` | The value to set. |

#### Returns

`TTLCache`\<`V`\>

The cache instance.

***

### values()

> **values**(): `V`[]

Defined in: [utils/TTLCache.ts:105](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/TTLCache.ts#L105)

Returns an array of all values in the cache.

#### Returns

`V`[]
