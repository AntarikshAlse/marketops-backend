import { FLUSH_INTERVAL_MS } from '../constants/index.ts';
import { normalizeTrade } from '../providers/finnhub/FinnhubNormalizer.ts';
import { FinnhubProvider } from '../providers/finnhub/FinnhubProvider.ts';
import { MarketStore } from '../store/MarketStore.ts';
import { TradeUpdate } from '../types/market.ts';
import { createMessage } from '../server/protocol.ts';

export class MarketService {
    private readonly pending = new Map<string, TradeUpdate>();

    constructor(
        private readonly provider: FinnhubProvider,
        private readonly marketStore: MarketStore,
        private readonly broadcast: (payload: unknown) => void,
    ) { }

    start() {
        this.provider.onMessage((message) => {
            if (message.type !== 'trade') return;

            for (const trade of message.data) {
                const normalized = normalizeTrade(trade);

                this.marketStore.updateTrade(
                    normalized.symbol,
                    normalized.price,
                    normalized.volume,
                    normalized.timestamp,
                );

                const symbol = this.marketStore.get(normalized.symbol);

                if (!symbol || symbol.price === null || symbol.lastTradeTimestamp === null) {
                    continue;
                }

                this.pending.set(normalized.symbol, {
                    symbol: normalized.symbol,
                    price: symbol.price,
                    change: symbol.change,
                    volume: symbol.volume,
                    lastTradeTimestamp: symbol.lastTradeTimestamp,
                });
            }
        });

        this.provider.connect();

        setInterval(() => {
            if (this.pending.size === 0) {
                return;
            }

            this.broadcast(
                createMessage('update', {
                    updates: [...this.pending.values()],
                }),
            );

            this.pending.clear();
        }, FLUSH_INTERVAL_MS);
    }
}