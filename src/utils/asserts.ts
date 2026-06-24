type TypeMap = {
  bigint: bigint;
  boolean: boolean;
  function: (...args: any[]) => any;
  number: number;
  object: object;
  string: string;
  symbol: symbol;
  undefined: undefined;
};
export function assertType<T extends keyof TypeMap>(
  value: unknown,
  name: string,
  expected: T,
): value is TypeMap[T] {
  if (typeof value !== expected) {
    const type = typeof value;
    const t =
      type === 'object' ? (value === null ? 'null' : value ? value.constructor.name : type) : type;
    throw new TypeError(
      `it was expected that ${name} would be a ${expected}, but a ${t} was received`,
    );
  }
  return true;
}
export function assertInstance<I>(
  value: unknown,
  name: string,
  constructor: new (...args: any[]) => I,
): value is I {
  if (!(value instanceof constructor)) {
    const type = typeof value;
    const t =
      type === 'object' ? (type === null ? 'null' : value ? value.constructor.name : type) : type;
    throw new TypeError(
      `it was expected that ${name} would be a ${constructor.name} instance, but an ${t} was received`,
    );
  }
  return true;
}
