import WebSocket from 'ws';
import { env } from '../../config/env.ts';
import { MAX_BACKOFF_MS } from '../../constants/index.ts';
import { FinnhubMessage } from './FinnhubTypes.ts';

type TradeListener = (message: FinnhubMessage) => void;
import { FinnhubTrade } from './FinnhubTypes.js';

export function normalizeTrade(trade: FinnhubTrade) {
    return {
        symbol: trade.s,
        price: trade.p,
        volume: trade.v ?? 0,
        timestamp: trade.t,
    };
}

export class FinnhubProvider {
    private socket?: WebSocket;

    private reconnectAttempt = 0;

    private readonly listeners = new Set<TradeListener>();

    connect() {
        this.socket = new WebSocket(
            `wss://ws.finnhub.io?token=${env.finnhubToken}`,
        );

        this.socket.on('open', () => {
            this.reconnectAttempt = 0;

            console.log('Connected to Finnhub');

            for (const symbol of env.symbols) {
                this.socket?.send(
                    JSON.stringify({
                        type: 'subscribe',
                        symbol,
                    }),
                );
            }
        });

        this.socket.on('message', (raw) => {
            try {
                const message = JSON.parse(raw.toString()) as FinnhubMessage;

                this.listeners.forEach((listener) => listener(message));
            } catch (error) {
                console.error(error);
            }
        });

        this.socket.on('close', () => {
            this.scheduleReconnect();
        });

        this.socket.on('error', console.error);
    }

    onMessage(listener: TradeListener) {
        this.listeners.add(listener);
    }

    private scheduleReconnect() {
        this.reconnectAttempt++;

        const delay = Math.min(
            1000 * 2 ** this.reconnectAttempt,
            MAX_BACKOFF_MS,
        );

        console.log(`Reconnect in ${delay} ms`);

        setTimeout(() => this.connect(), delay);
    }

    isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}

