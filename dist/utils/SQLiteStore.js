import { mkdirSync, rmSync } from 'node:fs';
import { isAbsolute, resolve, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import ms from 'ms';
import { TTLCache } from './TTLCache.js';
import { assertInstance, assertType } from './asserts.js';
import { toError } from './converters.js';
/** A simple SQLite-based key-value store with caching. */
export class SQLiteStore {
    #cache;
    #db;
    #path;
    #initializing = false;
    #initialized = false;
    #dropping = false;
    #dropped = false;
    /**
     * Creates a new SQLiteStore instance in the specified path.
     * @param path The path to the SQLite database file.
     */
    constructor(path) {
        assertType(path, 'path', 'string');
        this.#path = isAbsolute(path) ? path : resolve(path);
        if (!this.#path.endsWith('.db')) {
            this.#path += '.db';
        }
        this.#cache = new TTLCache(ms('10m'));
    }
    /** Gets the SQLite database instance. */
    get db() {
        if (!this.#db) {
            throw new Error('uninitialized, calling .initialize() first');
        }
        return this.#db;
    }
    /** Gets the number of items in the store. */
    get size() {
        return this.keys().length;
    }
    /** Initializes the store. */
    init() {
        try {
            if (this.#initialized || this.#initializing) {
                return;
            }
            this.#initializing = true;
            mkdirSync(dirname(this.#path), { recursive: true });
            this.#db = new DatabaseSync(this.#path);
            this.db.exec('PRAGMA "journal_mode" = WAL;');
            this.db.exec('PRAGMA "synchronous" = NORMAL;');
            this.db.exec(`CREATE TABLE IF NOT EXISTS "values" (
  "key" TEXT NOT NULL,
  "value" BLOB NOT NULL,
  PRIMARY KEY("key")
);`);
            this.db.exec('CREATE INDEX IF NOT EXISTS "idx_values_key" ON "values"("key");');
            this.#initialized = true;
        }
        catch (e) {
            this.#initialized = false;
            throw toError(e);
        }
        finally {
            this.#initializing = false;
        }
    }
    /** Drops the store. */
    drop() {
        try {
            if (this.#dropped || this.#dropping) {
                return;
            }
            this.#dropping = true;
            this.#cache.clear();
            this.db.close();
            rmSync(this.#path, { recursive: true, force: true });
            rmSync(this.#path + '-wal', { recursive: true, force: true });
            rmSync(this.#path + '-shm', { recursive: true, force: true });
            this.#dropped = true;
        }
        catch (e) {
            this.#dropped = false;
            throw toError(e);
        }
        finally {
            this.#dropping = false;
            this.#initialized = false;
        }
    }
    /**
     * Gets a value from the store.
     * @param key The key for the value.
     * @returns The value if found, otherwise undefined.
     */
    get(key) {
        assertType(key, 'key', 'string');
        const cached = this.#cache.get(key);
        if (cached instanceof Uint8Array) {
            return cached;
        }
        const query = `SELECT "value" FROM "values" WHERE "key" = ?;`;
        const stmt = this.db.prepare(query);
        const row = stmt.get(key);
        if (!(row?.value instanceof Uint8Array)) {
            return undefined;
        }
        this.#cache.set(key, row.value);
        return row.value;
    }
    /**
     * Deletes a value from the store.
     * @param key The key for the value to delete.
     * @returns True if the value was found and deleted, otherwise false.
     */
    del(key) {
        assertType(key, 'key', 'string');
        this.#cache.del(key);
        this.db.prepare('DELETE FROM "values" WHERE "key" = ?;').run(key);
    }
    /**
     * Sets a value in the store.
     * @param key The key for the value.
     * @param value The value to set.
     * @returns The store instance.
     */
    set(key, value) {
        assertType(key, 'key', 'string');
        assertInstance(value, 'value', Uint8Array);
        this.#cache.set(key, value);
        const query = `INSERT INTO "values" ("key", "value") VALUES (?, ?)
ON CONFLICT("key") DO UPDATE SET "value" = excluded.value;`;
        const stmt = this.db.prepare(query);
        stmt.run(key, value);
        return this;
    }
    /**
     * Checks if the store contains a value for the given key.
     * @param key The key to check.
     * @returns True if the value exists, otherwise false.
     */
    has(key) {
        assertType(key, 'key', 'string');
        if (this.#cache.has(key)) {
            return true;
        }
        return this.get(key) !== undefined;
    }
    /** Returns an array of all keys in the store. */
    keys() {
        return this.entries().map((e) => e.key);
    }
    /** Returns an array of all values in the store. */
    values() {
        return this.entries().map((e) => e.value);
    }
    /** Returns an array of all entries (key-value pairs) in the store. */
    entries() {
        const query = `SELECT "key", "value" FROM "values";`;
        const stmt = this.db.prepare(query);
        const rows = stmt.all();
        return rows;
    }
}
