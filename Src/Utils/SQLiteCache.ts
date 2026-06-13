import fs from 'node:fs';
import path from 'node:path';
import sqlite from 'node:sqlite';
import Utils from './index.js';
import ms from 'ms';

export default class SQLiteCache {
  #cache: InstanceType<typeof Utils.TTLCache<Uint8Array>>;
  #ttl?: number;
  #dir: string;
  #name: string;
  #db?: sqlite.DatabaseSync;
  #initializing = false;
  #initialized = false;
  #dropping = false;
  #dropped = false;
  #interval?: NodeJS.Timeout;
  constructor(dir: string, name: string, ttl?: number) {
    Utils.assertType(dir, 'dir', 'string');
    Utils.assertType(name, 'name', 'string');
    if (ttl) {
      Utils.assertType(ttl, 'ttl', 'number');
      if (ttl < 1) {
        throw new TypeError('ttl must be a positive number');
      }
    }
    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new TypeError('illegal characters in name, only a-z0-9_ are allowed');
    }
    this.#dir = path.isAbsolute(dir) ? dir : path.resolve(dir);
    this.#name = name;
    this.#ttl = ttl;
    this.#cache = new Utils.TTLCache(ttl || ms('10m'));
  }
  #startCleaner() {
    if (this.#interval || !this.ttl) {
      return;
    }
    const period = Math.min(this.ttl, ms('30m'));
    this.#interval = setInterval(() => {
      if (!this.#db) {
        return;
      }
      try {
        const now = Date.now();
        this.db.prepare('DELETE FROM "values" WHERE ? > "expire";').run(now);
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
  get ttl() {
    return this.#ttl;
  }
  initialize() {
    try {
      if (this.#initialized || this.#initializing) {
        return;
      }
      this.#initializing = true;
      const filepath = path.join(this.dir, this.name + '.sqlite');
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      this.#db = new sqlite.DatabaseSync(filepath);
      this.#db.exec(`
PRAGMA "journal_mode" = WAL;
PRAGMA "synchronous" = NORMAL;

CREATE TABLE IF NOT EXISTS "values" (
  "key" TEXT NOT NULL,
  "value" BLOB NOT NULL${
    this.ttl
      ? `,
  "expire" INTEGER NOT NULL`
      : ''
  },
  PRIMARY KEY("key")
);

CREATE INDEX IF NOT EXISTS "i_values_key" ON "values"("key");
    `);
      this.#startCleaner();
      this.#initialized = true;
    } catch (v) {
      this.#initialized = false;
      throw Utils.toError(v);
    } finally {
      this.#initializing = false;
    }
  }
  drop() {
    try {
      if (this.#dropped || this.#dropping) {
        return;
      }
      this.#dropping = true;
      this.#stopCleaner();
      this.#cache.clear();
      this.db.close();
      this.#db = undefined;
      const filepath = path.join(this.dir, this.name + '.sqlite');
      fs.rmSync(filepath, { recursive: true, force: true });
      fs.rmSync(filepath + '-wal', { recursive: true, force: true });
      fs.rmSync(filepath + '-shm', { recursive: true, force: true });
      this.#dropped = true;
    } catch (v) {
      this.#dropped = false;
      throw Utils.toError(v);
    } finally {
      this.#dropping = false;
    }
  }
  get(key: string) {
    Utils.assertType(key, 'key', 'string');
    const cached = this.#cache.get(key);
    if (cached instanceof Uint8Array) {
      return cached;
    }
    const query = `SELECT "value" FROM "values" WHERE "key" = ?${this.ttl ? ' AND "expire" > ?' : ''};`;
    const stmt = this.db.prepare(query);
    const row = this.ttl ? stmt.get(key, Date.now()) : stmt.get(key);
    if (!(row?.value instanceof Uint8Array)) {
      return undefined;
    }
    this.#cache.set(key, row.value);
    return row.value;
  }
  del(key: string) {
    Utils.assertType(key, 'key', 'string');
    this.#cache.del(key);
    this.db.prepare('DELETE FROM "values" WHERE "key" = ?;').run(key);
  }
  set(key: string, value: Uint8Array) {
    Utils.assertType(key, 'key', 'string');
    Utils.assertInstance(value, 'value', Uint8Array);
    this.#cache.set(key, value);
    const query = `
INSERT INTO "values" ("key", "value"${this.ttl ? ', "expire"' : ''}) VALUES (?, ?${this.ttl ? ', ?' : ''})
ON CONFLICT("key") DO UPDATE SET "value" = excluded.value${this.ttl ? ', "expire" = excluded.expire' : ''};`;
    const stmt = this.db.prepare(query);
    if (this.ttl) {
      stmt.run(key, value, Date.now() + this.ttl);
    } else {
      stmt.run(key, value);
    }
  }
  has(key: string) {
    Utils.assertType(key, 'key', 'string');
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
    const query = `SELECT "key", "value" FROM "values"${this.ttl ? ' WHERE "expire" > ?' : ''};`;
    const stmt = this.db.prepare(query);
    const rows = this.ttl ? stmt.all(Date.now()) : stmt.all();
    return rows.filter((v) => typeof v?.key === 'string' && v?.value instanceof Uint8Array) as {
      key: string;
      value: Uint8Array;
    }[];
  }
}
