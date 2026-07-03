[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / SQLiteStore

# Class: SQLiteStore

Defined in: [utils/SQLiteStore.ts:10](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L10)

A simple SQLite-based key-value store with caching.

## Constructors

### Constructor

> **new SQLiteStore**(`path`): `SQLiteStore`

Defined in: [utils/SQLiteStore.ts:22](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L22)

Creates a new SQLiteStore instance in the specified path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | The path to the SQLite database file. |

#### Returns

`SQLiteStore`

## Accessors

### db

#### Get Signature

> **get** **db**(): `DatabaseSync`

Defined in: [utils/SQLiteStore.ts:31](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L31)

Gets the SQLite database instance.

##### Returns

`DatabaseSync`

***

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [utils/SQLiteStore.ts:38](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L38)

Gets the number of items in the store.

##### Returns

`number`

## Methods

### del()

> **del**(`key`): `void`

Defined in: [utils/SQLiteStore.ts:112](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L112)

Deletes a value from the store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value to delete. |

#### Returns

`void`

True if the value was found and deleted, otherwise false.

***

### drop()

> **drop**(): `void`

Defined in: [utils/SQLiteStore.ts:67](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L67)

Drops the store.

#### Returns

`void`

***

### entries()

> **entries**(): `object`[]

Defined in: [utils/SQLiteStore.ts:154](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L154)

Returns an array of all entries (key-value pairs) in the store.

#### Returns

`object`[]

***

### get()

> **get**(`key`): `Uint8Array`\<`ArrayBufferLike`\> \| `undefined`

Defined in: [utils/SQLiteStore.ts:92](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L92)

Gets a value from the store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value. |

#### Returns

`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`

The value if found, otherwise undefined.

***

### has()

> **has**(`key`): `boolean`

Defined in: [utils/SQLiteStore.ts:138](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L138)

Checks if the store contains a value for the given key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key to check. |

#### Returns

`boolean`

True if the value exists, otherwise false.

***

### init()

> **init**(): `void`

Defined in: [utils/SQLiteStore.ts:42](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L42)

Initializes the store.

#### Returns

`void`

***

### keys()

> **keys**(): `string`[]

Defined in: [utils/SQLiteStore.ts:146](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L146)

Returns an array of all keys in the store.

#### Returns

`string`[]

***

### set()

> **set**(`key`, `value`): `SQLiteStore`

Defined in: [utils/SQLiteStore.ts:123](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L123)

Sets a value in the store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key for the value. |
| `value` | `Uint8Array` | The value to set. |

#### Returns

`SQLiteStore`

The store instance.

***

### values()

> **values**(): `Uint8Array`\<`ArrayBufferLike`\>[]

Defined in: [utils/SQLiteStore.ts:150](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/SQLiteStore.ts#L150)

Returns an array of all values in the store.

#### Returns

`Uint8Array`\<`ArrayBufferLike`\>[]
