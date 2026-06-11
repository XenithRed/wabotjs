import Utils from '../Utils/index.js';
import * as baileys from 'baileys';
import type Socket from '../Socket.js';
import path from 'node:path';
import Constants from '../Constants.js';

export default class Message {
  #decoder = new TextDecoder('utf-8');
  #encoder = new TextEncoder();
  #dir: string;
  #store: InstanceType<typeof Utils.SQLiteStore>;
  constructor(dir: string) {
    Utils.assertString(dir, 'dir');
    this.#dir = path.isAbsolute(dir) ? dir : path.resolve(dir);
    this.#store = new Utils.SQLiteStore(this.#dir, 'message_store', Constants.MSG_STORE_TTL);
  }
  #process(id: string, message: baileys.WAProto.IMessage) {
    Utils.assertString(id, 'id');
    if (!this.#store.has(id)) {
      const str = JSON.stringify(message, (_, v) => {
        if (v instanceof Buffer) {
          return {
            type: 'Buffer',
            data: Array.from(new Uint8Array(v.buffer, v.byteOffset, v.byteLength)),
          };
        }
        if (v instanceof Uint8Array) {
          return {
            type: 'Uint8Array',
            data: Array.from(v),
          };
        }
        return v;
      });
      this.#store.set(id, this.#encoder.encode(str));
    }
  }
  bind(sock: Socket) {
    this.#store.initialize();
    sock.ev.on('messages.upsert', (u) => {
      for (const m of u.messages) {
        if (m.message && m.key.id) {
          this.#process(m.key.id, m.message);
        }
      }
    });
    sock.ev.on('messages.update', (u) => {
      for (const m of u) {
        if (m.key.id) {
          const curr = this.resolve(m.key.id);
          if (curr) {
            const message = {
              ...curr,
              ...m.update,
            };
            this.#process(m.key.id, message);
          }
        }
      }
    });
  }
  resolve(id: string) {
    Utils.assertString(id, 'id');
    const arr = this.#store.get(id);
    if (!(arr instanceof Uint8Array)) {
      return undefined;
    }
    const str = this.#decoder.decode(arr);
    return JSON.parse(str, (_, v) => {
      if (typeof v !== 'object' || v === null) {
        return v;
      }
      if (v.type === 'Buffer' && Array.from(v.data)) {
        return Buffer.from(v.data);
      }
      if (v.type === 'Uint8Array' && Array.from(v.data)) {
        return new Uint8Array(v.data);
      }
      return v;
    }) as baileys.WAProto.IMessage;
  }
}
