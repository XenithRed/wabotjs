import Utils from '../Utils/index.js';
import * as baileys from 'baileys';
import type Socket from '../Socket.js';
import path from 'node:path';
import ms from 'ms';

export default class Message {
  #decoder = new TextDecoder('utf-8');
  #encoder = new TextEncoder();
  #cache: InstanceType<typeof Utils.SQLiteCache>;
  constructor(dir: string) {
    Utils.assertType(dir, 'dir', 'string');
    this.#cache = new Utils.SQLiteCache(
      path.isAbsolute(dir) ? dir : path.resolve(dir),
      'message_cache',
      ms('1d'),
    );
  }
  #process(id: string, message: baileys.WAProto.IMessage) {
    Utils.assertType(id, 'id', 'string');
    if (!this.#cache.has(id)) {
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
      this.#cache.set(id, this.#encoder.encode(str));
    }
  }
  bind(sock: Socket) {
    this.#cache.initialize();
    sock.ev.on('messages.upsert', (u) => {
      for (const msg of u.messages) {
        if (msg.message && msg.key.id) {
          this.#process(msg.key.id, msg.message);
        }
      }
    });
    sock.ev.on('messages.update', (u) => {
      for (const msg of u) {
        if (msg.key.id) {
          const curr = this.resolve(msg.key.id);
          if (curr) {
            const message = {
              ...curr,
              ...msg.update,
            };
            this.#process(msg.key.id, message);
          }
        }
      }
    });
  }
  drop() {
    this.#cache.drop();
  }
  resolve(id: string) {
    Utils.assertType(id, 'id', 'string');
    const arr = this.#cache.get(id);
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
