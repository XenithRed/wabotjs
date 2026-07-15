import { makeWASocket } from 'baileys';
class Socket {
    #end;
    #logout;
    /**
     * Creates a new Socket instance.
     * @param config The configuration for the socket.
     */
    constructor(config) {
        const { end, logout, authState: _authState, ...rest } = makeWASocket(config);
        this.#end = end;
        this.#logout = logout;
        Object.assign(this, rest);
    }
    async end(err) {
        await this.#end(err);
    }
    async logout(err) {
        await this.#logout(err?.message);
    }
}
export { Socket };
