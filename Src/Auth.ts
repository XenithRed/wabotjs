import * as baileys from 'baileys';
import Utils from './Utils/index.js';
import path from 'node:path';

export default class Auth {
  #decoder = new TextDecoder('utf-8');
  #encoder = new TextEncoder();
  #store: InstanceType<typeof Utils.SQLiteStore>;
  #dir: string;
  #creds?: baileys.AuthenticationCreds;
  #keys?: baileys.SignalKeyStore;
  #loaded = false;
  #loading = false;
  constructor(dir: string) {
    Utils.assertString(dir, 'dir');
    this.#dir = path.isAbsolute(dir) ? dir : path.resolve(dir);
    this.#store = new Utils.SQLiteStore(this.#dir, 'auth');
  }
  get dir() {
    return this.#dir;
  }
  #makeKey(...args: string[]) {
    return args.join(':');
  }
  get<T = unknown>(key: string) {
    Utils.assertString(key, 'key');
    const arr = this.#store.get(key);
    if (!(arr instanceof Uint8Array)) {
      return undefined;
    }
    const str = this.#decoder.decode(arr);
    return JSON.parse(str, baileys.BufferJSON.reviver) as T;
  }
  set(key: string, value: object | string) {
    Utils.assertString(key, 'key');
    const str = JSON.stringify(value, baileys.BufferJSON.replacer);
    const arr = this.#encoder.encode(str);
    this.#store.set(key, arr);
  }
  del(key: string) {
    Utils.assertString(key, 'key');
    this.#store.del(key);
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
  load() {
    try {
      if (this.#loaded || this.#loading) {
        return;
      }
      this.#loading = true;
      this.#store.initialize();
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
            this.#store.db.exec('BEGIN TRANSACTION;');
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
            this.#store.db.exec('COMMIT;');
          } catch (v) {
            this.#store.db.exec('ROLLBACK;');
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
    this.#store.drop();
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
