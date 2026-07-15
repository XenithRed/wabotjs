import { assertType } from './asserts.js';
/**
 * A simple Least Recently Used (LRU) cache implementation.
 * @template V The type of values stored in the cache.
 */
export class LRUCache {
    #cache = new Map();
    #capacity;
    /**
     * Creates a new LRUCache instance with the specified capacity.
     * @param capacity The maximum number of items the cache can hold.
     */
    constructor(capacity) {
        assertType(capacity, 'capacity', 'number');
        if (capacity <= 0) {
            throw new TypeError('capacity must be a positive number greater than 0');
        }
        this.#capacity = capacity;
    }
    /** Gets the number of items in the cache. */
    get size() {
        return this.#cache.size;
    }
    /**
     * Sets a value in the cache.
     * @param key The key for the value.
     * @param value The value to set.
     * @returns The cache instance.
     */
    set(key, value) {
        assertType(key, 'key', 'string');
        if (this.#cache.has(key)) {
            this.#cache.delete(key);
        }
        this.#cache.set(key, value);
        if (this.#cache.size > this.#capacity) {
            const k = this.#cache.keys().next().value;
            if (k !== undefined) {
                this.#cache.delete(k);
            }
        }
        return this;
    }
    /**
     * Gets a value from the cache and marks it as recently used.
     * @param key The key for the value.
     * @returns The value if found, otherwise undefined.
     */
    get(key) {
        assertType(key, 'key', 'string');
        if (!this.#cache.has(key)) {
            return undefined;
        }
        const value = this.#cache.get(key);
        this.#cache.delete(key);
        this.#cache.set(key, value);
        return value;
    }
    /**
     * Deletes a value from the cache.
     * @param key The key for the value to delete.
     * @returns True if the value was found and deleted, otherwise false.
     */
    del(key) {
        assertType(key, 'key', 'string');
        return this.#cache.delete(key);
    }
    /** Clears the cache. */
    clear() {
        this.#cache.clear();
    }
    /**
     * Checks if the cache contains a value for the given key.
     * @param key The key to check.
     * @returns True if the value exists, otherwise false.
     */
    has(key) {
        assertType(key, 'key', 'string');
        return this.#cache.has(key);
    }
    /** Returns an array of all keys in the cache. */
    keys() {
        return this.#cache.keys().toArray();
    }
    /** Returns an array of all values in the cache. */
    values() {
        return this.#cache.values().toArray();
    }
    /** Returns an array of all entries (key-value pairs) in the cache. */
    entries() {
        return this.#cache.entries().toArray();
    }
}
