import { DatabaseSync } from 'node:sqlite';
/** A simple SQLite-based key-value store with caching. */
export declare class SQLiteStore {
    #private;
    /**
     * Creates a new SQLiteStore instance in the specified path.
     * @param path The path to the SQLite database file.
     */
    constructor(path: string);
    /** Gets the SQLite database instance. */
    get db(): DatabaseSync;
    /** Gets the number of items in the store. */
    get size(): number;
    /** Initializes the store. */
    init(): void;
    /** Drops the store. */
    drop(): void;
    /**
     * Gets a value from the store.
     * @param key The key for the value.
     * @returns The value if found, otherwise undefined.
     */
    get(key: string): Uint8Array<ArrayBufferLike> | undefined;
    /**
     * Deletes a value from the store.
     * @param key The key for the value to delete.
     * @returns True if the value was found and deleted, otherwise false.
     */
    del(key: string): void;
    /**
     * Sets a value in the store.
     * @param key The key for the value.
     * @param value The value to set.
     * @returns The store instance.
     */
    set(key: string, value: Uint8Array): this;
    /**
     * Checks if the store contains a value for the given key.
     * @param key The key to check.
     * @returns True if the value exists, otherwise false.
     */
    has(key: string): boolean;
    /** Returns an array of all keys in the store. */
    keys(): string[];
    /** Returns an array of all values in the store. */
    values(): Uint8Array<ArrayBufferLike>[];
    /** Returns an array of all entries (key-value pairs) in the store. */
    entries(): {
        key: string;
        value: Uint8Array;
    }[];
}
