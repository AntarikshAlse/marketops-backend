import { env } from "./config/env.js";
import { FinnhubProvider } from "./providers/finnhub/FinnhubProvider.js";
import { RealtimeServer } from "./server/realtimeServer.js";
import { AnalyticsService } from "./services/AnalyticsService.js";
import { MarketStore } from "./store/MarketStore.js";
import { RestServer } from "./server/restServer.js";

export class Application {
    private readonly store = new MarketStore(env.symbols);

    private readonly analytics = new AnalyticsService();

    private readonly provider = new FinnhubProvider();

    private readonly rest = new RestServer(); // Port argument removed from constructor
    private readonly realtime = new RealtimeServer(this.rest.getHttpServer()); // Attach directly to Express server reference

    private flushTimer?: NodeJS.Timeout;
    private heartbeatTimer?: NodeJS.Timeout;

    start() {
        this.rest.start(env.port);
        this.provider.subscribe(env.symbols);
        this.realtime.onConnection((client) => {
            client.send(
                JSON.stringify({
                    type: "snapshot",
                    payload: {
                        symbols: this.store.snapshot(),
                    },
                }),
            );
        });
        this.provider.onTrade((trade) => {
            const state = this.store.get(trade.symbol);

            if (!state) return;

            const analytics = this.analytics.processTrade(
                state,
                trade,
            );

            this.store.update(trade.symbol, {
                currentPrice: analytics.currentPrice,
                absoluteChange: analytics.absoluteChange,
                percentChange: analytics.percentChange,
                totalVolume: analytics.totalVolume,
                tradeCount: analytics.tradeCount,
                high: analytics.high,
                low: analytics.low,
                vwap: analytics.vwap,
                lastTradeTimestamp:
                    analytics.lastTradeTimestamp,
                stale: false,
            });

            this.store.appendHistory(
                trade.symbol,
                analytics.historyPoint,
            );

            this.realtime.queue({
                symbol: trade.symbol,
                price: analytics.currentPrice,
                change: analytics.absoluteChange,
                volume: analytics.totalVolume,
                lastTradeTimestamp:
                    analytics.lastTradeTimestamp,
            });
        });

        this.flushTimer = setInterval(() => {
            this.realtime.flush();
        }, 300);

        this.heartbeatTimer = setInterval(() => {
            this.realtime.broadcast({
                type: 'heartbeat',
                payload: {
                    timestamp: Date.now(),
                    connectedClients:
                        this.realtime.clientCount(),
                    providerConnected:
                        this.provider.isConnected(),
                },
            });
        }, 5000);

        this.provider.connect();

        console.log(
            ` MarketOps Backend listening on ${env.port}`,
        );
    }

    stop() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        this.rest.stop();

        this.provider.disconnect();

        this.realtime.close();

        console.log('MarketOps Backend stopped.');
    }
}