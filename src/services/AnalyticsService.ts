import { TradeUpdate } from '../types/market.ts';

export class AnalyticsService {
    calculateVWAP(updates: TradeUpdate[]) {
        let totalVolume = 0;
        let totalPriceVolume = 0;

        for (const trade of updates) {
            totalVolume += trade.volume;
            totalPriceVolume += trade.price * trade.volume;
        }

        return totalVolume === 0
            ? 0
            : totalPriceVolume / totalVolume;
    }
}