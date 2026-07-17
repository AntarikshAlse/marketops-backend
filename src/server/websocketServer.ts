import { WebSocketServer } from 'ws';
import { ClientManager } from './clientManager.ts';
import { MarketStore } from '../store/MarketStore.ts';
import { createMessage } from './protocol.ts';

export function createFrontendServer(
    port: number,
    marketStore: MarketStore,
) {
    const clients = new ClientManager();

    const server = new WebSocketServer({
        port,
    });

    server.on('connection', (socket) => {
        clients.add(socket);

        socket.send(
            JSON.stringify(
                createMessage('snapshot', {
                    symbols: marketStore.getSnapshot(),
                }),
            ),
        );

        socket.on('close', () => {
            clients.remove(socket);
        });

        socket.on('error', console.error);
    });

    return {
        clients,
        server,
    };
}