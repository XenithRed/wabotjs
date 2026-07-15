import type { AuthenticationCreds, SignalKeyStore } from 'baileys';
import { SQLiteStore } from './utils/index.js';
/** A class for managing authentication state. */
export declare class Auth {
    #private;
    /** The SQLite store for persisting authentication state. */
    store: SQLiteStore;
    /**
     * Creates a new Auth instance with the specified path for the SQLite store.
     * @param path The path to the directory where the SQLite store will be created.
     */
    constructor(path: string);
    /** Gets the authentication credentials. */
    get creds(): AuthenticationCreds;
    /** Gets the signal keys store. */
    get keys(): SignalKeyStore;
    /**
     * Gets a value from the SQLite store and parses it as JSON.
     * @template T The expected type of the value.
     * @param key The key of the value to retrieve.
     * @returns The parsed value if found, otherwise undefined.
     */
    get<T>(key: string): T | undefined;
    /**
     * Sets a value in the SQLite store after serializing it to JSON.
     * @param key The key of the value to set.
     * @param value The value to set.
     * @returns The Auth instance.
     */
    set(key: string, value: object | string): this;
    /**
     * Deletes a value from the SQLite store.
     * @param key The key of the value to delete.
     */
    del(key: string): void;
    /** Loads the authentication state from the SQLite store. */
    load(): void;
    /** Drops the authentication state from the SQLite store. */
    drop(): void;
    /** Saves the authentication state to the SQLite store. */
    save(): void;
    /** Closes the SQLite store. */
    close(): void;
}
