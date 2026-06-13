import Utils from '../Utils/index.js';
import * as baileys from 'baileys';
import type Socket from '../Socket.js';
import path from 'node:path';

export default class JID {
  #decoder = new TextDecoder('utf-8');
  #encoder = new TextEncoder();
  #cache: InstanceType<typeof Utils.SQLiteCache>;
  constructor(dir: string) {
    Utils.assertType(dir, 'dir', 'string');
    this.#cache = new Utils.SQLiteCache(
      path.isAbsolute(dir) ? dir : path.resolve(dir),
      'jid_cache',
    );
  }
  #process(lid: string, pn: string) {
    Utils.assertType(lid, 'lid', 'string');
    Utils.assertType(pn, 'pn', 'string');
    if (!this.#cache.has(lid) && !this.#cache.has(pn)) {
      this.#cache.set(lid, this.#encoder.encode(baileys.jidNormalizedUser(pn)));
      this.#cache.set(pn, this.#encoder.encode(baileys.jidNormalizedUser(lid)));
    }
  }
  bind(sock: Socket) {
    this.#cache.initialize();
    sock.ev.on('messages.upsert', (u) => {
      if (u.type !== 'notify') {
        return;
      }
      for (const msg of u.messages) {
        if (msg.key.remoteJid && msg.key.remoteJidAlt) {
          const resolved = Utils.resolveLIDAndPN(msg.key.remoteJid, msg.key.remoteJidAlt);
          if (resolved) {
            this.#process(resolved.lid, resolved.pn);
          }
        }
        if (msg.key.participant && msg.key.participantAlt) {
          const resolved = Utils.resolveLIDAndPN(msg.key.participant, msg.key.participantAlt);
          if (resolved) {
            this.#process(resolved.lid, resolved.pn);
          }
        }
      }
    });
    sock.ev.on('connection.update', (u) => {
      if (u.connection === 'open') {
        if (sock.user) {
          const resolved = Utils.resolveLIDAndPN(
            sock.user.lid,
            sock.user.id,
            sock.user.phoneNumber,
          );
          if (resolved) {
            this.#process(resolved.lid, resolved.pn);
          }
        }
      }
    });
  }
  drop() {
    this.#cache.drop();
  }
  resolve(jid: string) {
    Utils.assertType(jid, 'jid', 'string');
    if (!baileys.isLidUser(jid) && !baileys.isPnUser(jid)) {
      return undefined;
    }
    const arr = this.#cache.get(jid);
    if (!(arr instanceof Uint8Array)) {
      return undefined;
    }
    const result = this.#decoder.decode(arr);
    return baileys.isLidUser(result) ? { lid: result, pn: jid } : { lid: jid, pn: result };
  }
}
