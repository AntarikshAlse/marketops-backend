### MarketOps Backend

marketops-backend/

src/

├── index.ts // Entry
│
├── config/
│ └── env.ts
│
├── constants/
│ └── index.ts
│
├── providers/
│ └── FinnhubProvider.ts
│
├── server/
│ ├── WebSocketServer.ts
│ ├── ClientManager.ts
│ └── protocol.ts
│
├── store/
│ └── MarketStore.ts
│
├── services/
│ ├── MarketService.ts
│ ├── AnalyticsService.ts
│ ├── IndicatorService.ts
│ ├── HeartbeatService.ts
│ └── StaleService.ts
│
├── routes/
│ ├── quote.ts
│ ├── profile.ts
│ ├── candles.ts
│ └── news.ts
│
├── schemas/
│ ├── protocol.ts
│ ├── market.ts
│ └── finnhub.ts
│
├── types/
│
└── utils/
