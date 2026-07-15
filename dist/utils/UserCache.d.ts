import type { User } from '../Bot.js';
/** An in-memory cache for users. */
export declare class UserCache {
    #private;
    constructor();
    /** Gets the number of items in the cache. */
    get size(): number;
    /**
     * Sets a user in the cache.
     * @param user The user to set.
     * @returns The cache instance.
     */
    set(user: User): this;
    /**
     * Gets a user from the cache by LID or PN.
     * @param user The user to get (by LID or PN).
     * @returns The user if found, otherwise undefined.
     */
    get(user: Partial<User>): User | undefined;
    /**
     * Deletes a user from the cache by LID or PN.
     * @param user The user to delete (by LID or PN).
     * @returns True if the user was found and deleted, otherwise false.
     */
    del(user: Partial<User>): boolean;
    /** Clears the cache. */
    clear(): void;
    /**
     * Checks if the cache contains a user by LID or PN.
     * @param user The user to check (by LID or PN).
     * @returns True if the user exists, otherwise false.
     */
    has(user: Partial<User>): boolean;
    /** Returns an array of all keys in the cache. */
    keys(): string[];
    /** Returns an array of all values in the cache. */
    values(): User[];
    /** Returns an array of all entries (key-value pairs) in the cache. */
    entries(): [string, User][];
}
