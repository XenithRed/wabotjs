import Utils from '../Utils/index.js';
import * as baileys from 'baileys';
import type Socket from '../Socket.js';
import path from 'node:path';

export default class JID {
  #decoder = new TextDecoder('utf-8');
  #encoder = new TextEncoder();
  #dir: string;
  #store: InstanceType<typeof Utils.SQLiteStore>;
  constructor(dir: string) {
    Utils.assertString(dir, 'dir');
    this.#dir = path.isAbsolute(dir) ? dir : path.resolve(dir);
    this.#store = new Utils.SQLiteStore(this.#dir, 'jid_store');
  }
  #process(lid: string, pn: string) {
    Utils.assertString(lid, 'lid');
    Utils.assertString(pn, 'pn');
    if (!this.#store.has(lid) && !this.#store.has(pn)) {
      this.#store.set(lid, this.#encoder.encode(baileys.jidNormalizedUser(pn)));
      this.#store.set(pn, this.#encoder.encode(baileys.jidNormalizedUser(lid)));
    }
  }
  bind(sock: Socket) {
    this.#store.initialize();
    sock.ev.on('messages.upsert', (u) => {
      if (u.type !== 'notify') {
        return;
      }
      for (const m of u.messages) {
        if (m.key.remoteJid && m.key.remoteJidAlt) {
          const resolved = Utils.resolveLIDAndPN(m.key.remoteJid, m.key.remoteJidAlt);
          if (resolved) {
            this.#process(resolved.lid, resolved.pn);
          }
        }
        if (m.key.participant && m.key.participantAlt) {
          const resolved = Utils.resolveLIDAndPN(m.key.participant, m.key.participantAlt);
          if (resolved) {
            this.#process(resolved.lid, resolved.pn);
          }
        }
      }
    });
    sock.ev.on('connection.update', (u) => {
      if (u.connection === 'open') {
        const resolved = Utils.resolveLIDAndPN(
          sock.user!.lid,
          sock.user!.id,
          sock.user!.phoneNumber,
        );
        if (resolved) {
          this.#process(resolved.lid, resolved.pn);
        }
      }
    });
  }
  resolve(jid: string) {
    Utils.assertString(jid, 'jid');
    if (!baileys.isLidUser(jid) && !baileys.isPnUser(jid)) {
      return undefined;
    }
    const arr = this.#store.get(jid);
    if (!(arr instanceof Uint8Array)) {
      return undefined;
    }
    const result = this.#decoder.decode(arr);
    return baileys.isLidUser(result) ? { lid: result, pn: jid } : { lid: jid, pn: result };
  }
}
