[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / LRUCache

# Class: LRUCache\<V\>

Defined in: [utils/LRUCache.ts:7](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L7)

A simple Least Recently Used (LRU) cache implementation.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `V` | The type of values stored in the cache. |

## Constructors

### Constructor

> **new LRUCache**\<`V`\>(`capacity`): `LRUCache`\<`V`\>

Defined in: [utils/LRUCache.ts:14](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L14)

Creates a new LRUCache instance with the specified capacity.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `capacity` | `number` | The maximum number of items the cache can hold. |

#### Returns

`LRUCache`\<`V`\>

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [utils/LRUCache.ts:22](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L22)

Gets the number of items in the cache.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/LRUCache.ts:70](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L70)

Clears the cache.

#### Returns

`void`

***

### del()

> **del**(`key`): `boolean`

Defined in: [utils/LRUCache.ts:65](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L65)

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

Defined in: [utils/LRUCache.ts:91](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L91)

Returns an array of all entries (key-value pairs) in the cache.

#### Returns

\[`string`, `V`\][]

***

### get()

> **get**(`key`): `NonNullable`\<`V`\> \| `undefined`

Defined in: [utils/LRUCache.ts:50](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L50)

Gets a value from the cache and marks it as recently used.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value. |

#### Returns

`NonNullable`\<`V`\> \| `undefined`

The value if found, otherwise undefined.

***

### has()

> **has**(`key`): `boolean`

Defined in: [utils/LRUCache.ts:78](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L78)

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

Defined in: [utils/LRUCache.ts:83](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L83)

Returns an array of all keys in the cache.

#### Returns

`string`[]

***

### set()

> **set**(`key`, `value`): `LRUCache`\<`V`\>

Defined in: [utils/LRUCache.ts:31](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L31)

Sets a value in the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value. |
| `value` | `V` | The value to set. |

#### Returns

`LRUCache`\<`V`\>

The cache instance.

***

### values()

> **values**(): `V`[]

Defined in: [utils/LRUCache.ts:87](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/LRUCache.ts#L87)

Returns an array of all values in the cache.

#### Returns

`V`[]
