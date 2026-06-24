import ms from 'ms';
import { assertType } from './index.js';

export class TTLCache<V> {
  #cache = new Map<string, { expire: number; value: V }>();
  #ttl: number;
  #interval?: NodeJS.Timeout;
  constructor(ttl: number) {
    assertType(ttl, 'ttl', 'number');
    if (ttl < 1) {
      throw new TypeError('ttl must be a positive number');
    }
    this.#ttl = ttl;
  }
  #startCleaner() {
    if (this.#interval) {
      return;
    }
    const period = Math.min(this.ttl, ms('30m'));
    this.#interval = setInterval(() => {
      const now = Date.now();
      for (const [k, v] of this.#cache.entries()) {
        if (now > v.expire) {
          this.#cache.delete(k);
        }
      }
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
  get size() {
    return this.values().length;
  }
  get ttl() {
    return this.#ttl;
  }
  set(key: string, value: V) {
    assertType(key, 'key', 'string');
    const now = Date.now();
    this.#cache.set(key, { expire: now + this.ttl, value });
    this.#startCleaner();
    return this;
  }
  get(key: string) {
    assertType(key, 'key', 'string');
    const now = Date.now();
    const cached = this.#cache.get(key);
    return cached && now < cached.expire ? cached.value : undefined;
  }
  del(key: string) {
    assertType(key, 'key', 'string');
    return this.#cache.delete(key);
  }
  clear() {
    this.#cache.clear();
    this.#stopCleaner();
  }
  has(key: string) {
    assertType(key, 'key', 'string');
    const now = Date.now();
    const cached = this.#cache.get(key);
    return cached && now < cached.expire ? true : false;
  }
  keys() {
    return this.entries().map(([k]) => k);
  }
  values() {
    return this.entries().map(([_, v]) => v);
  }
  entries() {
    const now = Date.now();
    return this.#cache
      .entries()
      .toArray()
      .filter(([_, v]) => now < v.expire)
      .map(([k, v]) => [k, v.value]) as [string, V][];
  }
}
