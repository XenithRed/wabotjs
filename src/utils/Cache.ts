export class Cache<V extends object> {
  #items: V[] = [];
  constructor() {}
  #match(item: V, query: Partial<V>) {
    return (Object.entries(query) as [keyof V, V[keyof V]][]).every(([k, v]) => item[k] === v);
  }
  get size() {
    return this.#items.length;
  }
  set(item: V) {
    if (!this.has(item)) {
      this.del(item);
    }
    this.#items.push(item);
    return this;
  }
  get(query: Partial<V>) {
    return this.#items.find((i) => this.#match(i, query));
  }
  del(query: Partial<V>) {
    const item = this.get(query);
    const idx = item ? this.#items.indexOf(item) : -1;
    if (idx < 0) {
      return false;
    }
    this.#items.splice(idx, 1);
    return true;
  }
  clear() {
    this.#items = [];
  }
  has(query: Partial<V>) {
    return this.#items.some((i) => this.#match(i, query));
  }
  values() {
    return this.#items.values().toArray();
  }
}
