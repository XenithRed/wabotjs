[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / assertType

# Function: assertType()

> **assertType**\<`T`\>(`value`, `name`, `expected`): `value is TypeMap[T]`

Defined in: [utils/asserts.ts:18](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/asserts.ts#L18)

Asserts that a value is of a specific type. This function will throw a TypeError if the value is not of the expected type.

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* keyof `TypeMap` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `unknown` | The value to check. |
| `name` | `string` | The name of the value (used in the error message). |
| `expected` | `T` | The expected type of the value. |

## Returns

`value is TypeMap[T]`

True if the value is of the expected type, otherwise throws a TypeError.
