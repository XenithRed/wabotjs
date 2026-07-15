import { isLidUser, isPnUser } from 'baileys';
import { assertType } from './asserts.js';
/** An in-memory cache for users. */
export class UserCache {
    #cache = new Map();
    constructor() { }
    /** Gets the number of items in the cache. */
    get size() {
        return this.#cache.size;
    }
    /**
     * Sets a user in the cache.
     * @param user The user to set.
     * @returns The cache instance.
     */
    set(user) {
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
    /**
     * Gets a user from the cache by LID or PN.
     * @param user The user to get (by LID or PN).
     * @returns The user if found, otherwise undefined.
     */
    get(user) {
        if (user.lid && this.#cache.has(user.lid)) {
            return this.#cache.get(user.lid);
        }
        if (user.pn && this.#cache.has(user.pn)) {
            return this.#cache.get(user.pn);
        }
        return undefined;
    }
    /**
     * Deletes a user from the cache by LID or PN.
     * @param user The user to delete (by LID or PN).
     * @returns True if the user was found and deleted, otherwise false.
     */
    del(user) {
        const cached = this.get(user);
        if (!cached) {
            return false;
        }
        this.#cache.delete(cached.lid);
        this.#cache.delete(cached.pn);
        return true;
    }
    /** Clears the cache. */
    clear() {
        this.#cache.clear();
    }
    /**
     * Checks if the cache contains a user by LID or PN.
     * @param user The user to check (by LID or PN).
     * @returns True if the user exists, otherwise false.
     */
    has(user) {
        if (user.lid && this.#cache.has(user.lid)) {
            return true;
        }
        if (user.pn && this.#cache.has(user.pn)) {
            return true;
        }
        return false;
    }
    /** Returns an array of all keys in the cache. */
    keys() {
        return this.#cache.keys().toArray();
    }
    /** Returns an array of all values in the cache. */
    values() {
        return new Set(this.#cache.values()).values().toArray();
    }
    /** Returns an array of all entries (key-value pairs) in the cache. */
    entries() {
        return this.#cache.entries().toArray();
    }
}
