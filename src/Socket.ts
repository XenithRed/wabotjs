import { makeWASocket } from 'baileys';
import type { WASocket, UserFacingSocketConfig } from 'baileys';

/**
 * An easy-to-extend makeWASocket wrapper class.
 * To see all the features provided by makeWASocket, visit https://github.com/whiskeysockets/baileys/tree/master/src/Socket
 */
interface Socket extends Omit<WASocket, 'end' | 'logout' | 'authState'> {}
class Socket {
  #end: (msg?: Error) => Promise<void>;
  #logout: (msg?: string) => Promise<void>;
  /**
   * Creates a new Socket instance.
   * @param config The configuration for the socket.
   */
  constructor(config: UserFacingSocketConfig) {
    const { end, logout, authState: _authState, ...rest } = makeWASocket(config);
    this.#end = end;
    this.#logout = logout;
    Object.assign(this, rest);
  }
  async end(err?: Error) {
    await this.#end(err);
  }
  async logout(err?: Error) {
    await this.#logout(err?.message);
  }
}
export { Socket };
