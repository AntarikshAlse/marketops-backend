import WebSocket from 'ws.ts';

export class ClientManager {
    private readonly clients = new Set<WebSocket>();

    add(client: WebSocket) {
        this.clients.add(client);
    }

    remove(client: WebSocket) {
        this.clients.delete(client);
    }

    size() {
        return this.clients.size;
    }

    broadcast(message: unknown) {
        const payload = JSON.stringify(message);

        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }
}