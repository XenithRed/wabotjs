import { BufferJSON, initAuthCreds, WAProto } from 'baileys';
import { assertType, SQLiteStore, toError } from './utils/index.js';
import { join, isAbsolute, resolve } from 'node:path';
/** A class for managing authentication state. */
export class Auth {
    #decoder = new TextDecoder('utf-8');
    #encoder = new TextEncoder();
    #creds;
    #keys;
    #loaded = false;
    #loading = false;
    /** The SQLite store for persisting authentication state. */
    store;
    /**
     * Creates a new Auth instance with the specified path for the SQLite store.
     * @param path The path to the directory where the SQLite store will be created.
     */
    constructor(path) {
        assertType(path, 'path', 'string');
        const filepath = join(isAbsolute(path) ? path : resolve(path), 'auth.db');
        this.store = new SQLiteStore(filepath);
    }
    /** Gets the authentication credentials. */
    get creds() {
        if (!this.#creds) {
            throw new Error('unloaded, calling .load() first');
        }
        return this.#creds;
    }
    /** Gets the signal keys store. */
    get keys() {
        if (!this.#keys) {
            throw new Error('unloaded, calling .load() first');
        }
        return this.#keys;
    }
    /**
     * Gets a value from the SQLite store and parses it as JSON.
     * @template T The expected type of the value.
     * @param key The key of the value to retrieve.
     * @returns The parsed value if found, otherwise undefined.
     */
    get(key) {
        assertType(key, 'key', 'string');
        const arr = this.store.get(key);
        if (!(arr instanceof Uint8Array)) {
            return undefined;
        }
        const str = this.#decoder.decode(arr);
        return JSON.parse(str, BufferJSON.reviver);
    }
    /**
     * Sets a value in the SQLite store after serializing it to JSON.
     * @param key The key of the value to set.
     * @param value The value to set.
     * @returns The Auth instance.
     */
    set(key, value) {
        assertType(key, 'key', 'string');
        const str = JSON.stringify(value, BufferJSON.replacer);
        const arr = this.#encoder.encode(str);
        this.store.set(key, arr);
        return this;
    }
    /**
     * Deletes a value from the SQLite store.
     * @param key The key of the value to delete.
     */
    del(key) {
        assertType(key, 'key', 'string');
        this.store.del(key);
    }
    /** Loads the authentication state from the SQLite store. */
    load() {
        try {
            if (this.#loaded || this.#loading) {
                return;
            }
            this.#loading = true;
            this.store.init();
            this.#creds = this.get('creds') || initAuthCreds();
            this.#keys = {
                get: (type, ids) => {
                    const data = {};
                    ids.forEach((i) => {
                        const key = `${type}:${i}`;
                        let value = this.get(key);
                        if (type === 'app-state-sync-key' && value) {
                            value = WAProto.Message.AppStateSyncKeyData.create(value);
                        }
                        data[i] = value;
                    });
                    return data;
                },
                set: (data) => {
                    try {
                        this.store.db.exec('BEGIN TRANSACTION;');
                        Object.keys(data).forEach((t) => {
                            Object.keys(data[t] || {}).forEach((i) => {
                                const key = `${t}:${i}`;
                                const value = data[t]?.[i];
                                value ? this.set(key, value) : this.del(key);
                            });
                        });
                        this.store.db.exec('COMMIT;');
                    }
                    catch (e) {
                        this.store.db.exec('ROLLBACK;');
                        throw toError(e);
                    }
                },
            };
            this.#loaded = true;
        }
        catch (e) {
            this.#loaded = false;
            throw toError(e);
        }
        finally {
            this.#loading = false;
        }
    }
    /** Drops the authentication state from the SQLite store. */
    drop() {
        this.store.drop();
        this.#creds = undefined;
        this.#keys = undefined;
        this.#loaded = false;
    }
    /** Saves the authentication state to the SQLite store. */
    save() {
        this.set('creds', this.creds);
    }
    /** Closes the SQLite store. */
    close() {
        this.store.db.close();
        this.#creds = undefined;
        this.#keys = undefined;
        this.#loaded = false;
    }
}
