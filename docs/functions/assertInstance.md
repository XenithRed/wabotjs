[**@jzszdznzzl/wabotjs v2.0.0**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / assertInstance

# Function: assertInstance()

> **assertInstance**\<`T`\>(`value`, `name`, `constructor`): `value is T`

Defined in: [utils/asserts.ts:40](https://github.com/jzszdznzzl/wabotjs/blob/f328acb0ee54f3fb8d455b21e446a61667279f4d/src/utils/asserts.ts#L40)

Asserts that a value is an instance of a specific constructor. This function will throw a TypeError if the value is not an instance of the expected constructor.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `unknown` | The value to check. |
| `name` | `string` | The name of the value (used in the error message). |
| `constructor` | (...`args`) => `T` | The expected constructor. |

## Returns

`value is T`

True if the value is an instance of the expected constructor, otherwise throws a TypeError.
