import fs from 'node:fs';
import path from 'node:path';
import sqlite from 'node:sqlite';
import Utils from './index.js';

export default class SQLiteStore {
  #cache: InstanceType<typeof Utils.TTLCache<{ value: Uint8Array }>>;
  #ttl?: number;
  #dir: string;
  #name: string;
  #db?: sqlite.DatabaseSync;
  #initializing = false;
  #dropping = false;
  #interval?: NodeJS.Timeout;
  constructor(dir: string, name: string, ttl?: number) {
    Utils.assertString(dir, 'dir');
    Utils.assertString(name, 'name');
    if (ttl && (typeof ttl !== 'number' || ttl < 1)) {
      throw new TypeError('ttl must be a positive number');
    }
    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new TypeError('illegal characters in name, only a-z0-9_ are allowed');
    }
    this.#dir = path.isAbsolute(dir) ? dir : path.resolve(dir);
    this.#name = name;
    this.#ttl = ttl;
    this.#cache = new Utils.TTLCache<{ value: Uint8Array }>(ttl || 1000 * 60 * 10);
  }
  #startCleaner() {
    if (this.#interval || !this.#ttl) {
      return;
    }
    const period = Math.min(this.#ttl, 1000 * 60 * 30);
    this.#interval = setInterval(() => {
      if (!this.#db) {
        return;
      }
      try {
        const now = Date.now();
        this.#db.prepare('DELETE FROM "values" WHERE ? > "expire";').run(now);
      } catch (v) {
        console.error(Utils.toError(v));
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
  get dir() {
    return this.#dir;
  }
  get name() {
    return this.#name;
  }
  get db() {
    if (!this.#db) {
      throw new Error('uninitialized db, calling .initialize() first');
    }
    return this.#db;
  }
  initialize() {
    try {
      if (this.#db || this.#initializing) {
        return;
      }
      this.#initializing = true;
      const filepath = path.join(this.#dir, this.#name + '.sqlite');
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      this.#db = new sqlite.DatabaseSync(filepath);
      this.#db.exec(`
PRAGMA "journal_mode" = WAL;
PRAGMA "synchronous" = NORMAL;

CREATE TABLE IF NOT EXISTS "values" (
  "key" TEXT NOT NULL,
  "value" BLOB NOT NULL${this.#ttl ? ',\n  "expire" INTEGER NOT NULL' : ''},
  PRIMARY KEY("key")
);

CREATE INDEX IF NOT EXISTS "i_values_key" ON "values"("key");
    `);
      this.#startCleaner();
    } catch (v) {
      throw Utils.toError(v);
    } finally {
      this.#initializing = false;
    }
  }
  drop() {
    try {
      if (!this.#db || this.#dropping) {
        return;
      }
      this.#dropping = true;
      this.#stopCleaner();
      this.#cache.clear();
      this.db.close();
      this.#db = undefined;
      const filepath = path.join(this.#dir, this.#name + '.sqlite');
      fs.rmSync(filepath, { recursive: true, force: true });
      fs.rmSync(filepath + '-wal', { recursive: true, force: true });
      fs.rmSync(filepath + '-shm', { recursive: true, force: true });
    } catch (v) {
      throw Utils.toError(v);
    } finally {
      this.#dropping = false;
    }
  }
  get(key: string) {
    Utils.assertString(key, 'key');
    const cached = this.#cache.get(key);
    if (cached?.value instanceof Uint8Array) {
      return cached.value;
    }
    const query = `SELECT "value" FROM "values" WHERE "key" = ?${this.#ttl ? ' AND "expire" > ?' : ''};`;
    const stmt = this.db.prepare(query);
    const row = this.#ttl ? stmt.get(key, Date.now()) : stmt.get(key);
    if (!(row?.value instanceof Uint8Array)) {
      return undefined;
    }
    this.#cache.set(key, { value: row.value });
    return row.value;
  }
  del(key: string) {
    Utils.assertString(key, 'key');
    this.#cache.del(key);
    this.db.prepare('DELETE FROM "values" WHERE "key" = ?;').run(key);
  }
  set(key: string, value: Uint8Array) {
    Utils.assertString(key, 'key');
    Utils.assertUint8Array(value, 'value');
    this.#cache.set(key, { value });
    const query = `
INSERT INTO "values" ("key", "value"${this.#ttl ? ', "expire"' : ''}) VALUES (?, ?${this.#ttl ? ', ?' : ''})
ON CONFLICT("key") DO UPDATE SET "value" = excluded.value${this.#ttl ? ', "expire" = excluded.expire' : ''};`;
    const stmt = this.db.prepare(query);
    if (this.#ttl) {
      stmt.run(key, value, Date.now() + this.#ttl);
    } else {
      stmt.run(key, value);
    }
  }
  has(key: string) {
    Utils.assertString(key, 'key');
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
    const query = `SELECT "key", "value" FROM "values"${this.#ttl ? ' WHERE "expire" > ?' : ''};`;
    const stmt = this.db.prepare(query);
    const rows = this.#ttl ? stmt.all(Date.now()) : stmt.all();
    return rows.filter((v) => typeof v?.key === 'string' && v?.value instanceof Uint8Array) as {
      key: string;
      value: Uint8Array;
    }[];
  }
}
