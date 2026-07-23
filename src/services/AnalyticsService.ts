import type { PricePoint, SymbolState } from "../store/MarketStore.ts";

export interface TradeEvent {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
}

export interface AnalyticsResult {
    currentPrice: number;

    absoluteChange: number;

    percentChange: number;

    high: number;

    low: number;

    totalVolume: number;

    tradeCount: number;

    vwap: number;

    lastTradeTimestamp: number;

    historyPoint: PricePoint;
}

export class AnalyticsService {
    processTrade(
        state: SymbolState,
        trade: TradeEvent,
    ): AnalyticsResult {
        const previousClose =
            state.previousClose ?? trade.price;

        const absoluteChange =
            trade.price - previousClose;

        const percentChange =
            previousClose === 0
                ? 0
                : (absoluteChange / previousClose) * 100;

        const totalVolume =
            state.totalVolume + trade.volume;

        const tradeCount =
            state.tradeCount + 1;

        const high =
            state.high === null
                ? trade.price
                : Math.max(state.high, trade.price);

        const low =
            state.low === null
                ? trade.price
                : Math.min(state.low, trade.price);

        const previousWeightedPrice =
            state.vwap * state.totalVolume;

        const weightedPrice =
            previousWeightedPrice +
            trade.price * trade.volume;

        const vwap =
            totalVolume === 0
                ? trade.price
                : weightedPrice / totalVolume;

        return {
            currentPrice: trade.price,

            absoluteChange,

            percentChange,

            high,

            low,

            totalVolume,

            tradeCount,

            vwap,

            lastTradeTimestamp: trade.timestamp,

            historyPoint: {
                timestamp: trade.timestamp,
                price: trade.price,
                volume: trade.volume,
            },
        };
    }
}