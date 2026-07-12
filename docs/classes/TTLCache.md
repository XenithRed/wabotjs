[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / TTLCache

# Class: TTLCache\<V\>

Defined in: utils/TTLCache.ts:8

A simple Time to Live (TTL) cache implementation.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `V` | The type of values stored in the cache. |

## Constructors

### Constructor

> **new TTLCache**\<`V`\>(`ttl`): `TTLCache`\<`V`\>

Defined in: utils/TTLCache.ts:16

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

Defined in: utils/TTLCache.ts:48

Gets the number of items in the cache.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Defined in: utils/TTLCache.ts:85

Clears the cache.

#### Returns

`void`

***

### del()

> **del**(`key`): `boolean`

Defined in: utils/TTLCache.ts:80

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

Defined in: utils/TTLCache.ts:109

Returns an array of all entries (key-value pairs) in the cache.

#### Returns

\[`string`, `V`\][]

***

### get()

> **get**(`key`): `V` \| `undefined`

Defined in: utils/TTLCache.ts:69

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

Defined in: utils/TTLCache.ts:94

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

Defined in: utils/TTLCache.ts:101

Returns an array of all keys in the cache.

#### Returns

`string`[]

***

### set()

> **set**(`key`, `value`): `TTLCache`\<`V`\>

Defined in: utils/TTLCache.ts:57

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

Defined in: utils/TTLCache.ts:105

Returns an array of all values in the cache.

#### Returns

`V`[]
