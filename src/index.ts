import { env } from './config/env.ts';
import { MarketStore } from './store/MarketStore.ts';
import { createFrontendServer } from './server/websocketServer.ts';
import { FinnhubProvider } from './providers/finnhub/FinnhubProvider.ts';
import { MarketService } from './services/MarketService.ts';
import { HeartbeatService } from './services/HeartbeatService.ts';

const marketStore = new MarketStore(env.symbols);

const { clients } = createFrontendServer(
    env.port,
    marketStore,
);

const provider = new FinnhubProvider();

const marketService = new MarketService(
    provider,
    marketStore,
    clients.broadcast.bind(clients),
);

marketService.start();

new HeartbeatService(
    clients.broadcast.bind(clients),
    () => clients.size(),
    () => provider.isConnected(),
).start();

console.log(`MarketOps Backend listening on ${env.port}`);