import * as baileys from 'baileys';

interface Socket extends Omit<baileys.WASocket, 'end' | 'logout' | 'authState'> {}
class Socket {
  #end: (msg?: Error) => Promise<void>;
  #logout: (msg?: string) => Promise<void>;
  constructor(config: baileys.UserFacingSocketConfig) {
    const { end, logout, authState: _authState, ...rest } = baileys.makeWASocket(config);
    this.#end = end;
    this.#logout = logout;
    Object.assign(this, rest);
  }
  async end(reason?: Error) {
    await this.#end(reason);
  }
  async logout(reason?: Error) {
    await this.#logout(reason?.message);
  }
}
export default Socket;
