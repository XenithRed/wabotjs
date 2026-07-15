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
/**
 * Asserts that a value is of a specific type. This function will throw a TypeError if the value is not of the expected type.
 * @param value The value to check.
 * @param name The name of the value (used in the error message).
 * @param expected The expected type of the value.
 * @returns True if the value is of the expected type, otherwise throws a TypeError.
 */
export declare function assertType<T extends keyof TypeMap>(value: unknown, name: string, expected: T): value is TypeMap[T];
/**
 * Asserts that a value is an instance of a specific constructor. This function will throw a TypeError if the value is not an instance of the expected constructor.
 * @param value The value to check.
 * @param name The name of the value (used in the error message).
 * @param constructor The expected constructor.
 * @returns True if the value is an instance of the expected constructor, otherwise throws a TypeError.
 */
export declare function assertInstance<T>(value: unknown, name: string, constructor: new (...args: any[]) => T): value is T;
export {};
