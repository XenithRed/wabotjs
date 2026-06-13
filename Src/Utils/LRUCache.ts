import Utils from './index.js';

export default class LRUCache<V> {
  #cache = new Map<string, V>();
  #capacity: number;
  constructor(capacity: number) {
    Utils.assertType(capacity, 'capacity', 'number');
    if (capacity < 1) {
      throw new TypeError('capacity must be a positive number');
    }
    this.#capacity = capacity;
  }
  get size() {
    return this.#cache.size;
  }
  get capacity() {
    return this.#capacity;
  }
  set(key: string, value: V) {
    Utils.assertType(key, 'key', 'string');
    if (this.#cache.has(key)) {
      this.#cache.delete(key);
    }
    this.#cache.set(key, value);
    if (this.#cache.size > this.capacity) {
      const k = this.#cache.keys().next().value;
      if (k !== undefined) {
        this.#cache.delete(k);
      }
    }
    return this;
  }
  get(key: string) {
    Utils.assertType(key, 'key', 'string');
    if (!this.#cache.has(key)) {
      return undefined;
    }
    const value = this.#cache.get(key)!;
    this.#cache.delete(key);
    this.#cache.set(key, value);
    return value;
  }
  del(key: string) {
    Utils.assertType(key, 'key', 'string');
    return this.#cache.delete(key);
  }
  clear() {
    this.#cache.clear();
  }
  has(key: string) {
    Utils.assertType(key, 'key', 'string');
    return this.#cache.has(key);
  }
  keys() {
    return this.#cache.keys().toArray();
  }
  values() {
    return this.#cache.values().toArray();
  }
  entries() {
    return this.#cache.entries().toArray();
  }
}
