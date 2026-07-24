import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

export interface PendingUpdate {
    symbol: string;
    price: number;
    change: number;
    volume: number;
    lastTradeTimestamp: number;
}

export class RealtimeServer {
    private readonly wss: WebSocketServer;
    private readonly clients = new Set<WebSocket>();
    private readonly pending = new Map<string, PendingUpdate>();

    // Accept a shared server instance instead of an independent port
    constructor(server: http.Server) {
        this.wss = new WebSocketServer({
            server, // This links WS protocol upgrades to your Express port listener
        });

        this.wss.on('connection', (client) => {
            this.clients.add(client);

            client.on('close', () => {
                this.clients.delete(client);
            });
        });
    }

    onConnection(callback: (client: WebSocket) => void) {
        this.wss.on('connection', (client) => {
            callback(client);
        });
    }

    queue(update: PendingUpdate) {
        this.pending.set(update.symbol, update);
    }

    flush() {
        if (!this.pending.size) return;

        this.broadcast({
            type: 'update',
            payload: {
                updates: [...this.pending.values()],
            },
        });

        this.pending.clear();
    }

    broadcast(message: unknown) {
        const payload = JSON.stringify(message);

        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }

    clientCount() {
        return this.clients.size;
    }

    close() {
        for (const client of this.clients) {
            client.close();
        }
        this.clients.clear();
        this.wss.close();
    }
}