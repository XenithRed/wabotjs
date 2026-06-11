export function assertString(param: unknown, name: string): param is string {
  if (typeof param !== 'string') {
    const type = typeof param;
    throw new TypeError(
      `expected ${name} to be a string, but got ${type === 'object' ? param?.constructor.name : type}`,
    );
  }
  return true;
}
export function assertNumber(param: unknown, name: string): param is number {
  assertString(name, 'string');
  if (typeof param !== 'number' || isNaN(param)) {
    const type = typeof param;
    throw new TypeError(
      `expected ${name} to be a number, but got ${type === 'object' ? param?.constructor.name : type}`,
    );
  }
  return true;
}
export function assertBuffer(param: unknown, name: string): param is Buffer {
  assertString(name, 'name');
  if (!(param instanceof Buffer)) {
    const type = typeof param;
    throw new TypeError(
      `expected ${name} to be a Buffer, but got ${type === 'object' ? param?.constructor.name : type}`,
    );
  }
  return true;
}
export function assertUint8Array(param: unknown, name: string): param is Uint8Array {
  assertString(name, 'name');
  if (!(param instanceof Uint8Array)) {
    const type = typeof param;
    throw new TypeError(
      `expected ${name} to be a Uint8Array, but got ${type === 'object' ? param?.constructor.name : type}`,
    );
  }
  return true;
}
export function assertFunction(param: unknown, name: string): param is Function {
  assertString(name, 'name');
  if (typeof param !== 'function') {
    const type = typeof param;
    throw new TypeError(
      `expected ${name} to be a Function, but got ${type === 'object' ? param?.constructor.name : type}`,
    );
  }
  return true;
}
