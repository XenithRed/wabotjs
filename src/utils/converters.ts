export function toString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
export function toError(value: unknown) {
  if (value instanceof Error) {
    return value;
  }
  return new Error(toString(value));
}
