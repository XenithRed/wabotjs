import type { WASocket, UserFacingSocketConfig } from 'baileys';
/**
 * An easy-to-extend makeWASocket wrapper class.
 * To see all the features provided by makeWASocket, visit https://github.com/whiskeysockets/baileys/tree/master/src/Socket
 */
interface Socket extends Omit<WASocket, 'end' | 'logout' | 'authState'> {
}
declare class Socket {
    #private;
    /**
     * Creates a new Socket instance.
     * @param config The configuration for the socket.
     */
    constructor(config: UserFacingSocketConfig);
    end(err?: Error): Promise<void>;
    logout(err?: Error): Promise<void>;
}
export { Socket };
