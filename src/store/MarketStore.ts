import { MAX_HISTORY } from '../constants/index.ts';
import { SymbolState } from '../types/market.ts';

export class MarketStore {
    private readonly market = new Map<string, SymbolState>();

    constructor(symbols: string[]) {
        for (const symbol of symbols) {
            this.market.set(symbol, {
                symbol,
                price: null,
                change: 0,
                volume: 0,
                lastTradeTimestamp: null,
                stale: false,
                history: [],
            });
        }
    }

    get(symbol: string) {
        return this.market.get(symbol);
    }

    getSnapshot(): Record<string, SymbolState> {
        return Object.fromEntries(this.market);
    }

    updateTrade(
        symbol: string,
        price: number,
        volume: number,
        timestamp: number,
    ) {
        const item = this.market.get(symbol);

        if (!item) return;

        const previous = item.price;

        item.price = price;

        item.change =
            previous === null ? 0 : Number((price - previous).toFixed(4));

        item.volume += volume;

        item.lastTradeTimestamp = timestamp;

        item.stale = false;

        item.history.push({
            timestamp,
            price,
        });

        if (item.history.length > MAX_HISTORY) {
            item.history.shift();
        }
    }

    markStale(symbol: string) {
        const item = this.market.get(symbol);

        if (!item) return;

        item.stale = true;
    }

    entries() {
        return this.market.entries();
    }
}