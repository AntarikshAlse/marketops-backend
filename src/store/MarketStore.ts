import { MAX_HISTORY } from "../constants/index.ts";
import { CircularBuffer } from "../utils/CircularBuffer.ts";

export interface PricePoint {
    timestamp: number;
    price: number;
    volume: number;
}

export interface SymbolState {
    symbol: string;
    companyName?: string;
    exchange?: string;
    currentPrice: number | null;
    previousClose: number | null;
    absoluteChange: number;
    percentChange: number;
    totalVolume: number;
    tradeCount: number;
    open: number | null;
    high: number | null;
    low: number | null;
    vwap: number;
    lastTradeTimestamp: number | null;
    stale: boolean;
    history: CircularBuffer<PricePoint>;
}

export class MarketStore {
    private readonly symbols = new Map<string, SymbolState>();

    constructor(watchlist: string[]) {
        for (const symbol of watchlist) {
            this.symbols.set(symbol, {
                symbol,
                currentPrice: null,
                previousClose: null,
                absoluteChange: 0,
                percentChange: 0,
                totalVolume: 0,
                tradeCount: 0,
                open: null,
                high: null,
                low: null,
                vwap: 0,
                lastTradeTimestamp: null,
                stale: false,
                history: new CircularBuffer<PricePoint>(
                    MAX_HISTORY,
                ),
            });
        }
    }

    get(symbol: string) {
        return this.symbols.get(symbol);
    }

    getAll() {
        return this.symbols;
    }

    snapshot() {
        return Object.fromEntries(
            [...this.symbols.entries()].map(
                ([symbol, state]) => [
                    symbol,
                    {
                        ...state,
                        history: state.history.toArray(),
                    },
                ],
            ),
        );
    }

    update(symbol: string, update: Partial<SymbolState>) {
        const state = this.symbols.get(symbol);

        if (!state) return;

        Object.assign(state, update);
    }

    appendHistory(
        symbol: string,
        point: PricePoint,
    ) {
        const state = this.symbols.get(symbol);

        if (!state) return;

        state.history.push(point);
    }

    markStale(symbol: string) {
        const state = this.symbols.get(symbol);

        if (!state) return;

        state.stale = true;
    }

    markAlive(symbol: string) {
        const state = this.symbols.get(symbol);

        if (!state) return;

        state.stale = false;
    }
}