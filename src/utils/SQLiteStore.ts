import { mkdirSync, rmSync } from 'node:fs';
import { isAbsolute, resolve, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import ms from 'ms';
import { TTLCache } from './TTLCache.js';
import { assertInstance, assertType } from './asserts.js';
import { toError } from './converters.js';

export class SQLiteStore {
  #cache: TTLCache<Uint8Array>;
  #db: DatabaseSync;
  #filepath: string;
  #initializing = false;
  #initialized = false;
  #dropping = false;
  #dropped = false;
  constructor(filepath: string) {
    assertType(filepath, 'filepath', 'string');
    this.#filepath = isAbsolute(filepath) ? filepath : resolve(filepath);
    if (!this.filepath.endsWith('.db')) {
      this.#filepath + '.db';
    }
    mkdirSync(dirname(this.filepath), { recursive: true });
    this.#db = new DatabaseSync(this.filepath);
    this.#cache = new TTLCache(ms('10m'));
  }
  get filepath() {
    return this.#filepath;
  }
  get size() {
    return this.keys().length;
  }
  exec(sql: string) {
    if (!this.#initialized) {
      throw new Error('uninitialized, calling .initialize() first');
    }
    assertType(sql, 'sql', 'string');
    this.#db.exec(sql);
  }
  prepare(sql: string) {
    if (!this.#initialized) {
      throw new Error('uninitialized, calling .initialize() first');
    }
    assertType(sql, 'sql', 'string');
    return this.#db.prepare(sql);
  }
  transaction<T>(fn: (...args: any[]) => T) {
    if (!this.#initialized) {
      throw new Error('uninitialized, calling .initialize() first');
    }
    assertType(fn, 'fn', 'function');
    return (...args: any[]): T => {
      this.exec('BEGIN TRANSACTION;');
      try {
        const result = fn(...args);
        this.exec('COMMIT;');
        return result;
      } catch (e) {
        this.exec('ROLLBACK;');
        throw toError(e);
      }
    };
  }
  initialize() {
    try {
      if (this.#initialized || this.#initializing) {
        return;
      }
      this.#initializing = true;
      this.#db.exec(`PRAGMA "journal_mode" = WAL;
PRAGMA "synchronous" = NORMAL;`);
      this.#db.exec(`CREATE TABLE IF NOT EXISTS "values" (
  "key" TEXT NOT NULL,
  "value" BLOB NOT NULL,
  PRIMARY KEY("key")
);
CREATE INDEX IF NOT EXISTS "i_values_key" ON "values"("key");`);
      this.#initialized = true;
    } catch (e) {
      this.#initialized = false;
      throw toError(e);
    } finally {
      this.#initializing = false;
    }
  }
  drop() {
    try {
      if (this.#dropped || this.#dropping) {
        return;
      }
      if (!this.#initialized) {
        throw new Error('uninitialized');
      }
      this.#dropping = true;
      this.#cache.clear();
      this.#db.close();
      rmSync(this.filepath, { recursive: true, force: true });
      rmSync(this.filepath + '-wal', { recursive: true, force: true });
      rmSync(this.filepath + '-shm', { recursive: true, force: true });
      this.#dropped = true;
    } catch (e) {
      this.#dropped = false;
      throw toError(e);
    } finally {
      this.#dropping = false;
      this.#initialized = false;
    }
  }
  close() {
    try {
      if (!this.#initialized) {
        throw new Error('uninitialized');
      }
      this.#db.close();
    } catch (e) {
      throw toError(e);
    } finally {
      this.#initialized = false;
    }
  }
  get(key: string) {
    assertType(key, 'key', 'string');
    const cached = this.#cache.get(key);
    if (cached instanceof Uint8Array) {
      return cached;
    }
    const query = `SELECT "value" FROM "values" WHERE "key" = ?;`;
    const stmt = this.prepare(query);
    const row = stmt.get(key);
    if (!(row?.value instanceof Uint8Array)) {
      return undefined;
    }
    this.#cache.set(key, row.value);
    return row.value;
  }
  del(key: string) {
    assertType(key, 'key', 'string');
    this.#cache.del(key);
    this.prepare('DELETE FROM "values" WHERE "key" = ?;').run(key);
  }
  set(key: string, value: Uint8Array) {
    assertType(key, 'key', 'string');
    assertInstance(value, 'value', Uint8Array);
    this.#cache.set(key, value);
    const query = `INSERT INTO "values" ("key", "value") VALUES (?, ?)
ON CONFLICT("key") DO UPDATE SET "value" = excluded.value;`;
    const stmt = this.prepare(query);
    stmt.run(key, value);
  }
  has(key: string) {
    assertType(key, 'key', 'string');
    if (this.#cache.has(key)) {
      return true;
    }
    return this.get(key) !== undefined;
  }
  keys() {
    return this.entries().map((v) => v.key);
  }
  values() {
    return this.entries().map((v) => v.value);
  }
  entries() {
    const query = `SELECT "key", "value" FROM "values";`;
    const stmt = this.prepare(query);
    const rows = stmt.all();
    return rows as { key: string; value: Uint8Array }[];
  }
}
