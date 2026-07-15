/**
 * Asserts that a value is of a specific type. This function will throw a TypeError if the value is not of the expected type.
 * @param value The value to check.
 * @param name The name of the value (used in the error message).
 * @param expected The expected type of the value.
 * @returns True if the value is of the expected type, otherwise throws a TypeError.
 */
export function assertType(value, name, expected) {
    if (typeof value !== expected) {
        const type = typeof value;
        const t = type === 'object' ? (value === null ? 'null' : value ? value.constructor.name : type) : type;
        throw new TypeError(`it was expected that "${name}" would be a ${expected}, but a ${t} was received`);
    }
    return true;
}
/**
 * Asserts that a value is an instance of a specific constructor. This function will throw a TypeError if the value is not an instance of the expected constructor.
 * @param value The value to check.
 * @param name The name of the value (used in the error message).
 * @param constructor The expected constructor.
 * @returns True if the value is an instance of the expected constructor, otherwise throws a TypeError.
 */
export function assertInstance(value, name, constructor) {
    if (!(value instanceof constructor)) {
        const type = typeof value;
        const t = type === 'object' ? (type === null ? 'null' : value ? value.constructor.name : type) : type;
        throw new TypeError(`it was expected that "${name}" would be a ${constructor.name} instance, but an ${t} was received`);
    }
    return true;
}
