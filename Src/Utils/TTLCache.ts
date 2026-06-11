import Utils from './index.js';

export default class TTLCache<V> {
  #cache = new Map<string, { expire: number; value: V }>();
  #ttl: number;
  #interval?: NodeJS.Timeout;
  constructor(ttl: number) {
    if (typeof ttl !== 'number' || ttl < 1) {
      throw new TypeError('ttl must be a positive number');
    }
    this.#ttl = ttl;
  }
  #startCleaner() {
    if (this.#interval) {
      return;
    }
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
    }, this.#ttl);
    this.#interval.unref();
  }
  #stopCleaner() {
    if (!this.#interval) {
      return;
    }
    clearInterval(this.#interval);
  }
  get size() {
    return this.values().length;
  }
  set(key: string, value: V) {
    Utils.assertString(key, 'key');
    this.#cache.set(key, { expire: this.#ttl + Date.now(), value });
    this.#startCleaner();
    return this;
  }
  get(key: string) {
    Utils.assertString(key, 'key');
    return this.#cache.get(key)?.value;
  }
  del(key: string) {
    Utils.assertString(key, 'key');
    return this.#cache.delete(key);
  }
  clear() {
    this.#cache.clear();
    this.#stopCleaner();
  }
  has(key: string) {
    Utils.assertString(key, 'key');
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
