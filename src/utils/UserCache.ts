import { isLidUser, isPnUser } from 'baileys';
import type { User } from '../Bot.js';
import { assertType } from './asserts.js';

export class UserCache {
  #cache = new Map<string, User>();
  constructor() {}
  get size() {
    return this.values().length;
  }
  set(user: User) {
    assertType(user.lid, 'user.lid', 'string');
    assertType(user.pn, 'user.pn', 'string');
    if (!isLidUser(user.lid)) {
      throw new TypeError('invalid user lid');
    }
    if (!isPnUser(user.pn)) {
      throw new TypeError('invalid user pn');
    }
    this.#cache.set(user.lid, user);
    this.#cache.set(user.pn, user);
    return this;
  }
  get(user: Partial<User>) {
    if (user.lid && this.#cache.has(user.lid)) {
      return this.#cache.get(user.lid);
    }
    if (user.pn && this.#cache.has(user.pn)) {
      return this.#cache.get(user.pn);
    }
    return undefined;
  }
  del(user: Partial<User>) {
    const cached = this.get(user);
    if (!cached) {
      return false;
    }
    this.#cache.delete(cached.lid);
    this.#cache.delete(cached.pn);
    return true;
  }
  clear() {
    this.#cache.clear();
  }
  has(user: Partial<User>) {
    if (user.lid && this.#cache.has(user.lid)) {
      return true;
    }
    if (user.pn && this.#cache.has(user.pn)) {
      return true;
    }
    return false;
  }
  keys() {
    return this.#cache.keys().toArray();
  }
  values() {
    return new Set(this.#cache.values()).values().toArray();
  }
  entries() {
    return this.#cache.entries().toArray();
  }
}
