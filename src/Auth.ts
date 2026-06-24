import { BufferJSON, initAuthCreds, WAProto } from 'baileys';
import type {
  AuthenticationCreds,
  SignalKeyStore,
  SignalDataSet,
  SignalDataTypeMap,
} from 'baileys';
import { assertType, SQLiteStore, toError } from './utils/index.js';
import { join, isAbsolute, resolve } from 'node:path';

export class Auth {
  #decoder = new TextDecoder('utf-8');
  #encoder = new TextEncoder();
  #store: SQLiteStore;
  #creds?: AuthenticationCreds;
  #keys?: SignalKeyStore;
  #loaded = false;
  #loading = false;
  constructor(path: string) {
    assertType(path, 'path', 'string');
    const filepath = join(isAbsolute(path) ? path : resolve(path), 'auth.db');
    this.#store = new SQLiteStore(filepath);
  }
  get creds() {
    if (!this.#loaded) {
      throw new Error('unloaded, calling .load() first');
    }
    return this.#creds!;
  }
  get keys() {
    if (!this.#loaded) {
      throw new Error('unloaded, calling .load() first');
    }
    return this.#keys!;
  }
  get<T>(key: string) {
    assertType(key, 'key', 'string');
    const arr = this.#store.get(key);
    if (!(arr instanceof Uint8Array)) {
      return undefined;
    }
    const str = this.#decoder.decode(arr);
    return JSON.parse(str, BufferJSON.reviver) as T;
  }
  set(key: string, value: object | string) {
    assertType(key, 'key', 'string');
    const str = JSON.stringify(value, BufferJSON.replacer);
    const arr = this.#encoder.encode(str);
    this.#store.set(key, arr);
  }
  del(key: string) {
    assertType(key, 'key', 'string');
    this.#store.del(key);
  }
  load() {
    try {
      if (this.#loaded || this.#loading) {
        return;
      }
      this.#loading = true;
      this.#store.initialize();
      this.#creds = this.get('creds') || initAuthCreds();
      this.#keys = {
        get: (type, ids) => {
          const data: Record<string, SignalDataTypeMap[typeof type]> = {};
          ids.forEach((i) => {
            const key = `${type}:${i}`;
            let value = this.get(key);
            if (type === 'app-state-sync-key' && value) {
              value = WAProto.Message.AppStateSyncKeyData.create(value);
            }
            data[i] = value as SignalDataTypeMap[typeof type];
          });
          return data;
        },
        set: (data) => {
          this.#store.transaction(() => {
            (Object.keys(data) as (keyof SignalDataSet)[]).forEach((t) => {
              Object.keys(data[t] || {}).forEach((i) => {
                const key = `${t}:${i}`;
                const value = data[t]?.[i];
                value ? this.set(key, value) : this.del(key);
              });
            });
          })();
        },
      };
      this.#loaded = true;
    } catch (v) {
      this.#loaded = false;
      throw toError(v);
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
  save() {
    this.set('creds', this.creds);
  }
  close() {
    this.#store.close();
    this.#creds = undefined;
    this.#keys = undefined;
    this.#loaded = false;
  }
}
