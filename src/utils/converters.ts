/**
 * Converts a value to a string.
 * @param value The value to convert.
 * @returns The string representation of the value.
 */
export function toString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
/**
 * Converts a value to an Error instance.
 * @param value The value to convert.
 * @returns An Error instance based on the value.
 */
export function toError(value: unknown) {
  if (value instanceof Error) {
    return value;
  }
  return new Error(toString(value));
}
