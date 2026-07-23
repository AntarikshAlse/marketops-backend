import WebSocket from 'ws';

import { env } from '../../config/env.ts';
import type {
    MarketDataProvider,
    TradeEvent,
} from '../BaseProviders.ts';

const MAX_BACKOFF = 30000;

export class FinnhubProvider
    implements MarketDataProvider {
    private socket?: WebSocket;

    private reconnectAttempt = 0;

    private symbols: string[] = [];

    private listeners = new Set<
        (trade: TradeEvent) => void
    >();

    connect() {
        this.socket = new WebSocket(
            `wss://ws.finnhub.io?token=${env.finnhubToken}`,
        );

        this.socket.on('open', () => {
            this.reconnectAttempt = 0;

            this.subscribe(this.symbols);

            console.log('Finnhub Connected');
        });

        this.socket.on('message', (raw) => {
            const message = JSON.parse(raw.toString());

            if (message.type !== 'trade') return;

            for (const trade of message.data) {
                const normalized: TradeEvent = {
                    symbol: trade.s,
                    price: trade.p,
                    volume: trade.v,
                    timestamp: trade.t,
                };

                this.listeners.forEach((listener) => {
                    listener(normalized)
                });
            }
        });

        this.socket.on('close', () => {
            this.reconnect();
        });

        this.socket.on('error', console.error);
    }

    disconnect() {
        this.socket?.close();
    }

    subscribe(symbols: string[]) {
        this.symbols = symbols;

        if (this.socket?.readyState !== WebSocket.OPEN)
            return;

        for (const symbol of symbols) {
            this.socket.send(
                JSON.stringify({
                    type: 'subscribe',
                    symbol,
                }),
            );
        }
    }

    onTrade(
        listener: (trade: TradeEvent) => void,
    ) {
        this.listeners.add(listener);
    }

    isConnected() {
        return (
            this.socket?.readyState === WebSocket.OPEN
        );
    }

    private reconnect() {
        this.reconnectAttempt++;

        const delay = Math.min(
            1000 * 2 ** this.reconnectAttempt,
            MAX_BACKOFF,
        );

        console.log(`Reconnect in ${delay} ms`);

        setTimeout(() => this.connect(), delay);
    }
}