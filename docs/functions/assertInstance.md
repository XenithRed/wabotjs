[**@jzszdznzzl/wabotjs v2.0.1**](../README.md)

***

[@jzszdznzzl/wabotjs](../README.md) / assertInstance

# Function: assertInstance()

> **assertInstance**\<`T`\>(`value`, `name`, `constructor`): `value is T`

Defined in: utils/asserts.ts:40

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
