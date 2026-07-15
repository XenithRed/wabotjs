/**
 * A simple Least Recently Used (LRU) cache implementation.
 * @template V The type of values stored in the cache.
 */
export declare class LRUCache<V> {
    #private;
    /**
     * Creates a new LRUCache instance with the specified capacity.
     * @param capacity The maximum number of items the cache can hold.
     */
    constructor(capacity: number);
    /** Gets the number of items in the cache. */
    get size(): number;
    /**
     * Sets a value in the cache.
     * @param key The key for the value.
     * @param value The value to set.
     * @returns The cache instance.
     */
    set(key: string, value: V): this;
    /**
     * Gets a value from the cache and marks it as recently used.
     * @param key The key for the value.
     * @returns The value if found, otherwise undefined.
     */
    get(key: string): NonNullable<V> | undefined;
    /**
     * Deletes a value from the cache.
     * @param key The key for the value to delete.
     * @returns True if the value was found and deleted, otherwise false.
     */
    del(key: string): boolean;
    /** Clears the cache. */
    clear(): void;
    /**
     * Checks if the cache contains a value for the given key.
     * @param key The key to check.
     * @returns True if the value exists, otherwise false.
     */
    has(key: string): boolean;
    /** Returns an array of all keys in the cache. */
    keys(): string[];
    /** Returns an array of all values in the cache. */
    values(): V[];
    /** Returns an array of all entries (key-value pairs) in the cache. */
    entries(): [string, V][];
}
