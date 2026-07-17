import { HEARTBEAT_INTERVAL_MS } from '../constants/index.ts';
import { createMessage } from '../server/protocol.ts';

export class HeartbeatService {
    constructor(
        private readonly broadcast: (message: unknown) => void,
        private readonly getClientCount: () => number,
        private readonly providerConnected: () => boolean,
    ) { }

    start() {
        setInterval(() => {
            this.broadcast(
                createMessage('heartbeat', {
                    uptime: process.uptime(),
                    connectedClients: this.getClientCount(),
                    providerConnected: this.providerConnected(),
                }),
            );
        }, HEARTBEAT_INTERVAL_MS);
    }
}