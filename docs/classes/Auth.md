[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / Auth

# Class: Auth

Defined in: [Auth.ts:12](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L12)

A class for managing authentication state.

## Constructors

### Constructor

> **new Auth**(`path`): `Auth`

Defined in: [Auth.ts:25](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L25)

Creates a new Auth instance with the specified path for the SQLite store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | The path to the directory where the SQLite store will be created. |

#### Returns

`Auth`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="store"></a> `store` | [`SQLiteStore`](SQLiteStore.md) | The SQLite store for persisting authentication state. | [Auth.ts:20](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L20) |

## Accessors

### creds

#### Get Signature

> **get** **creds**(): `AuthenticationCreds`

Defined in: [Auth.ts:31](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L31)

Gets the authentication credentials.

##### Returns

`AuthenticationCreds`

***

### keys

#### Get Signature

> **get** **keys**(): `SignalKeyStore`

Defined in: [Auth.ts:38](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L38)

Gets the signal keys store.

##### Returns

`SignalKeyStore`

## Methods

### close()

> **close**(): `void`

Defined in: [Auth.ts:139](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L139)

Closes the SQLite store.

#### Returns

`void`

***

### del()

> **del**(`key`): `void`

Defined in: [Auth.ts:76](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L76)

Deletes a value from the SQLite store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key of the value to delete. |

#### Returns

`void`

***

### drop()

> **drop**(): `void`

Defined in: [Auth.ts:128](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L128)

Drops the authentication state from the SQLite store.

#### Returns

`void`

***

### get()

> **get**\<`T`\>(`key`): `T` \| `undefined`

Defined in: [Auth.ts:50](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L50)

Gets a value from the SQLite store and parses it as JSON.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | The expected type of the value. |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key of the value to retrieve. |

#### Returns

`T` \| `undefined`

The parsed value if found, otherwise undefined.

***

### load()

> **load**(): `void`

Defined in: [Auth.ts:81](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L81)

Loads the authentication state from the SQLite store.

#### Returns

`void`

***

### save()

> **save**(): `void`

Defined in: [Auth.ts:135](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L135)

Saves the authentication state to the SQLite store.

#### Returns

`void`

***

### set()

> **set**(`key`, `value`): `Auth`

Defined in: [Auth.ts:65](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/Auth.ts#L65)

Sets a value in the SQLite store after serializing it to JSON.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key of the value to set. |
| `value` | `string` \| `object` | The value to set. |

#### Returns

`Auth`

The Auth instance.
