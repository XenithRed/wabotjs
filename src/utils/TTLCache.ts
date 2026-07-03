import ms from 'ms';
import { assertType } from './asserts.js';

/**
 * A simple Time to Live (TTL) cache implementation.
 * @template V The type of values stored in the cache.
 */
export class TTLCache<V> {
  #cache = new Map<string, { expire: number; value: V }>();
  #ttl: number;
  #interval?: NodeJS.Timeout;
  /**
   * Creates a new TTLCache instance with the specified time to live (TTL) in milliseconds.
   * @param ttl The time to live for each item in the cache.
   */
  constructor(ttl: number) {
    assertType(ttl, 'ttl', 'number');
    if (ttl <= 0) {
      throw new TypeError('ttl must be a positive number greater than 0');
    }
    this.#ttl = ttl;
  }
  #startCleaner() {
    if (this.#interval) {
      return;
    }
    const period = Math.min(this.#ttl, ms('30m'));
    this.#interval = setInterval(() => {
      const now = Date.now();
      this.#cache.forEach((v, k) => {
        if (now > v.expire) {
          this.#cache.delete(k);
        }
      });
      if (this.#cache.size < 1) {
        this.#stopCleaner();
      }
    }, period);
    this.#interval.unref();
  }
  #stopCleaner() {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
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
  set(key: string, value: V) {
    assertType(key, 'key', 'string');
    const now = Date.now();
    this.#cache.set(key, { expire: now + this.#ttl, value });
    this.#startCleaner();
    return this;
  }
  /**
   * Gets a value from the cache.
   * @param key The key for the value.
   * @returns The value if found, otherwise undefined.
   */
  get(key: string) {
    assertType(key, 'key', 'string');
    const now = Date.now();
    const cached = this.#cache.get(key);
    return cached && now < cached.expire ? cached.value : undefined;
  }
  /**
   * Deletes a value from the cache.
   * @param key The key for the value to delete.
   * @returns True if the value was found and deleted, otherwise false.
   */
  del(key: string) {
    assertType(key, 'key', 'string');
    return this.#cache.delete(key);
  }
  /** Clears the cache. */
  clear() {
    this.#cache.clear();
    this.#stopCleaner();
  }
  /**
   * Checks if the cache contains a value for the given key.
   * @param key The key to check.
   * @returns True if the value exists, otherwise false.
   */
  has(key: string) {
    assertType(key, 'key', 'string');
    const now = Date.now();
    const cached = this.#cache.get(key);
    return cached && now < cached.expire ? true : false;
  }
  /** Returns an array of all keys in the cache. */
  keys() {
    return this.entries().map(([k]) => k);
  }
  /** Returns an array of all values in the cache. */
  values() {
    return this.entries().map(([_, v]) => v);
  }
  /** Returns an array of all entries (key-value pairs) in the cache. */
  entries() {
    const now = Date.now();
    return this.#cache
      .entries()
      .toArray()
      .filter(([_, v]) => now < v.expire)
      .map(([k, v]) => [k, v.value]) as [string, V][];
  }
}
