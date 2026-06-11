import * as baileys from 'baileys';

interface Socket extends Omit<baileys.WASocket, 'end' | 'logout'> {}
class Socket {
  #ws: baileys.WASocket;
  constructor(config: baileys.UserFacingSocketConfig) {
    this.#ws = baileys.makeWASocket(config);
    const { end: _end, logout: _logout, ...rest } = this.#ws;
    Object.assign(this, rest);
  }
  async end(reason?: Error) {
    await this.#ws.end(reason);
  }
  async logout(reason?: Error) {
    await this.#ws.logout(reason?.message);
  }
}
export default Socket;
