import * as baileys from 'baileys';
import Utils from './Utils/index.js';
import path from 'node:path';

export default class Auth {
  #decoder = new TextDecoder('utf-8');
  #encoder = new TextEncoder();
  #cache: InstanceType<typeof Utils.SQLiteCache>;
  #creds?: baileys.AuthenticationCreds;
  #keys?: baileys.SignalKeyStore;
  #loaded = false;
  #loading = false;
  constructor(dir: string) {
    Utils.assertType(dir, 'dir', 'string');
    this.#cache = new Utils.SQLiteCache(path.isAbsolute(dir) ? dir : path.resolve(dir), 'auth');
  }
  #makeKey(...args: string[]) {
    return args.join(':');
  }
  get<T = unknown>(key: string) {
    Utils.assertType(key, 'key', 'string');
    const arr = this.#cache.get(key);
    if (!(arr instanceof Uint8Array)) {
      return undefined;
    }
    const str = this.#decoder.decode(arr);
    return JSON.parse(str, baileys.BufferJSON.reviver) as T;
  }
  get state() {
    if (!this.#creds || !this.#keys) {
      throw new Error('uninitialized creds or keys, calling .load() first');
    }
    return {
      creds: this.#creds,
      keys: this.#keys,
    } as baileys.AuthenticationState;
  }
  set(key: string, value: object | string) {
    Utils.assertType(key, 'key', 'string');
    const str = JSON.stringify(value, baileys.BufferJSON.replacer);
    const arr = this.#encoder.encode(str);
    this.#cache.set(key, arr);
  }
  del(key: string) {
    Utils.assertType(key, 'key', 'string');
    this.#cache.del(key);
  }
  load() {
    try {
      if (this.#loaded || this.#loading) {
        return;
      }
      this.#loading = true;
      this.#cache.initialize();
      this.#creds = this.get('creds') || baileys.initAuthCreds();
      this.#keys = {
        get: (type, ids) => {
          const data: Record<string, baileys.SignalDataTypeMap[typeof type]> = {};
          for (const id of ids) {
            const key = this.#makeKey(type, id);
            let value = this.get(key);
            if (type === 'app-state-sync-key' && value) {
              value = baileys.WAProto.Message.AppStateSyncKeyData.create(value);
            }
            data[id] = value as baileys.SignalDataTypeMap[typeof type];
          }
          return data;
        },
        set: (data) => {
          try {
            this.#cache.db.exec('BEGIN TRANSACTION;');
            for (const type of Object.keys(data) as (keyof baileys.SignalDataSet)[]) {
              if (!data[type]) {
                continue;
              }
              for (const id of Object.keys(data[type])) {
                const key = this.#makeKey(type, id);
                const value = data[type][id];
                value ? this.set(key, value) : this.del(key);
              }
            }
            this.#cache.db.exec('COMMIT;');
          } catch (v) {
            this.#cache.db.exec('ROLLBACK;');
            throw Utils.toError(v);
          }
        },
      };
      this.#loaded = true;
    } catch (v) {
      this.#loaded = false;
      throw Utils.toError(v);
    } finally {
      this.#loading = false;
    }
  }
  drop() {
    this.#cache.drop();
    this.#creds = undefined;
    this.#keys = undefined;
    this.#loaded = false;
  }
  saveCreds() {
    if (!this.#creds) {
      throw new Error('uninitialized creds, calling .load() first');
    }
    this.set('creds', this.#creds);
  }
  dropCreds() {
    if (!this.#creds) {
      throw new Error('uninitialized creds, calling .load() first');
    }
    this.del('creds');
    this.#creds = undefined;
    this.#loaded = false;
  }
}
