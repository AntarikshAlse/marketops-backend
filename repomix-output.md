This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed.

# File Summary

## Purpose

This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format

The content is organized as follows:

1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
   a. A header with the file path (## File: path/to/file)
   b. The full contents of the file in a code block

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure

```
src/
  config/
    env.ts
  constants/
    index.ts
  lib/
    finnhub.ts
  providers/
    finnhub/
      FinnhubProvider.ts
      FinnhubTypes.ts
    BaseProviders.ts
  routes/
    candles.ts
    news.ts
    profile.ts
    quote.ts
  schemas/
    finnhub.ts
    market.ts
    protocol.ts
  server/
    protocol.ts
    realtimeServer.ts
  services/
    AnalyticsService.ts
    finnhub.service.ts
  store/
    MarketStore.ts
  types/
    global.d.ts
    market.ts
    protocol.ts
    websocket.ts
  utils/
    CircularBuffer.ts
  application.ts
  index.ts
stock trades/
  opencollection.yml
.env.example
.gitignore
architecture.dot
architecture.png
architecture.svg
biome.json
folder_structure.md
package.json
pnpm-workspace.yaml
repomix-output.xml
tsconfig.json
```

# Files

## File: src/lib/finnhub.ts

```typescript
import finnhub from "finnhub";
export const finnhubClient = new finnhub.DefaultApi(
  process.env.FINNHUB_API_KEY,
);
```

## File: src/providers/BaseProviders.ts

```typescript
export interface TradeEvent {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}
export interface MarketDataProvider {
  connect(): void;
  disconnect(): void;
  subscribe(symbols: string[]): void;
  onTrade(listener: (trade: TradeEvent) => void): void;
  isConnected(): boolean;
}
```

## File: src/routes/candles.ts

```typescript

```

## File: src/routes/news.ts

```typescript
router.get("/:symbol", async (req, res) => {
  const news = await getCompanyNews(req.params.symbol);
  res.json(news);
});
```

## File: src/routes/profile.ts

```typescript

```

## File: src/routes/quote.ts

```typescript

```

## File: src/schemas/finnhub.ts

```typescript

```

## File: src/schemas/market.ts

```typescript

```

## File: src/schemas/protocol.ts

```typescript

```

## File: src/server/realtimeServer.ts

```typescript
import WebSocket, { WebSocketServer } from "ws";
export interface PendingUpdate {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  lastTradeTimestamp: number;
}
export class RealtimeServer {
  private readonly wss: WebSocketServer;
  private readonly clients = new Set<WebSocket>();
  private readonly pending = new Map<string, PendingUpdate>();
  constructor(port: number) {
    this.wss = new WebSocketServer({
      port,
    });
    this.wss.on("connection", (client) => {
      this.clients.add(client);
      client.on("close", () => {
        this.clients.delete(client);
      });
    });
  }
  onConnection(callback: (client: WebSocket) => void) {
    this.wss.on("connection", (client) => {
      callback(client);
    });
  }
  queue(update: PendingUpdate) {
    this.pending.set(update.symbol, update);
  }
  flush() {
    if (!this.pending.size) return;
    this.broadcast({
      type: "update",
      payload: {
        updates: [...this.pending.values()],
      },
    });
    this.pending.clear();
  }
  broadcast(message: unknown) {
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
  clientCount() {
    return this.clients.size;
  }
  close() {
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();
    this.wss.close();
  }
}
```

## File: src/services/finnhub.service.ts

```typescript
import { finnhubClient } from "../lib/finnhub.ts";
const now = new Date();
const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
export async function getCompanyNews(symbol: string) {
  return new Promise((resolve, reject) => {
    finnhubClient.companyNews(
      symbol,
      lastYear.toISOString().split("T")[0],
      now.toISOString().split("T")[0],
      (err, data) => {
        if (err) reject(err);
        else resolve(data);
      },
    );
  });
}
```

## File: src/types/global.d.ts

```typescript
declare module "finnhub";
```

## File: src/utils/CircularBuffer.ts

```typescript
export class CircularBuffer<T> {
  private readonly buffer: (T | undefined)[];
  private head = 0;
  private length = 0;
  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity);
  }
  push(value: T) {
    this.buffer[this.head] = value;
    this.head = (this.head + 1) % this.capacity;
    if (this.length < this.capacity) {
      this.length++;
    }
  }
  toArray(): T[] {
    const result: T[] = [];
    const start = (this.head - this.length + this.capacity) % this.capacity;
    for (let i = 0; i < this.length; i++) {
      result.push(this.buffer[(start + i) % this.capacity]!);
    }
    return result;
  }
  latest(): T | undefined {
    if (this.length === 0) return undefined;
    return this.buffer[(this.head - 1 + this.capacity) % this.capacity];
  }
  size() {
    return this.length;
  }
  clear() {
    this.head = 0;
    this.length = 0;
  }
}
```

## File: src/application.ts

```typescript
import { env } from "./config/env.ts";
import { FinnhubProvider } from "./providers/finnhub/FinnhubProvider.ts";
import { RealtimeServer } from "./server/realtimeServer.ts";
import { AnalyticsService } from "./services/AnalyticsService.ts";
import { MarketStore } from "./store/MarketStore.ts";
export class Application {
  private readonly store = new MarketStore(env.symbols);
  private readonly analytics = new AnalyticsService();
  private readonly provider = new FinnhubProvider();
  private readonly realtime = new RealtimeServer(env.port);
  private flushTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  start() {
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
      const analytics = this.analytics.processTrade(state, trade);
      this.store.update(trade.symbol, {
        currentPrice: analytics.currentPrice,
        absoluteChange: analytics.absoluteChange,
        percentChange: analytics.percentChange,
        totalVolume: analytics.totalVolume,
        tradeCount: analytics.tradeCount,
        high: analytics.high,
        low: analytics.low,
        vwap: analytics.vwap,
        lastTradeTimestamp: analytics.lastTradeTimestamp,
        stale: false,
      });
      this.store.appendHistory(trade.symbol, analytics.historyPoint);
      this.realtime.queue({
        symbol: trade.symbol,
        price: analytics.currentPrice,
        change: analytics.absoluteChange,
        volume: analytics.totalVolume,
        lastTradeTimestamp: analytics.lastTradeTimestamp,
      });
    });
    this.flushTimer = setInterval(() => {
      this.realtime.flush();
    }, 300);
    this.heartbeatTimer = setInterval(() => {
      this.realtime.broadcast({
        type: "heartbeat",
        payload: {
          timestamp: Date.now(),
          connectedClients: this.realtime.clientCount(),
          providerConnected: this.provider.isConnected(),
        },
      });
    }, 5000);
    this.provider.connect();
    console.log(` MarketOps Backend listening on ${env.port}`);
  }
  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    this.provider.disconnect();
    this.realtime.close();
    console.log("MarketOps Backend stopped.");
  }
}
```

## File: stock trades/opencollection.yml

```yaml
opencollection: 1.0.0
info:
  name: stock trades
bundled: false
extensions:
  bruno:
    ignore:
      - node_modules
      - .git
```

## File: repomix-output.xml

```xml
This file is a merged representation of the entire codebase, combined into a single document by Repomix.
<file_summary>
This section contains a summary of this file.
<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>
<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>
<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>
<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>
</file_summary>
<directory_structure>
src/
  config/
    env.ts
  constants/
    index.ts
  providers/
    finnhub/
      FinnhubProvider.ts
      FinnhubTypes.ts
    BaseProviders.ts
  routes/
    candles.ts
    news.ts
    profile.ts
    quote.ts
  schemas/
    finnhub.ts
    market.ts
    protocol.ts
  server/
    protocol.ts
    realtimeServer.ts
  services/
    AnalyticsService.ts
  store/
    MarketStore.ts
  types/
    market.ts
    protocol.ts
    websocket.ts
  utils/
    CircularBuffer.ts
  application.ts
  index.ts
stock trades/
  opencollection.yml
.env.example
.gitignore
architecture.dot
architecture.png
architecture.svg
biome.json
folder_structure.md
package.json
pnpm-workspace.yaml
tsconfig.json
</directory_structure>
<files>
This section contains the contents of the repository's files.
<file path="src/providers/BaseProviders.ts">
export interface TradeEvent {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
}
export interface MarketDataProvider {
    connect(): void;
    disconnect(): void;
    subscribe(symbols: string[]): void;
    onTrade(
        listener: (trade: TradeEvent) => void,
    ): void;
    isConnected(): boolean;
}
</file>
<file path="src/routes/candles.ts">
</file>
<file path="src/routes/news.ts">
</file>
<file path="src/routes/profile.ts">
</file>
<file path="src/routes/quote.ts">
</file>
<file path="src/schemas/finnhub.ts">
</file>
<file path="src/schemas/market.ts">
</file>
<file path="src/schemas/protocol.ts">
</file>
<file path="src/server/realtimeServer.ts">
import WebSocket, { WebSocketServer } from 'ws';
export interface PendingUpdate {
    symbol: string;
    price: number;
    change: number;
    volume: number;
    lastTradeTimestamp: number;
}
export class RealtimeServer {
    private readonly wss: WebSocketServer;
    private readonly clients = new Set<WebSocket>();
    private readonly pending = new Map<
        string,
        PendingUpdate
    >();
    constructor(port: number) {
        this.wss = new WebSocketServer({
            port,
        });
        this.wss.on('connection', (client) => {
            this.clients.add(client);
            client.on('close', () => {
                this.clients.delete(client);
            });
        });
    }
    onConnection(
        callback: (client: WebSocket) => void,
    ) {
        this.wss.on('connection', (client) => {
            callback(client);
        });
    }
    queue(update: PendingUpdate) {
        this.pending.set(update.symbol, update);
    }
    flush() {
        if (!this.pending.size) return;
        this.broadcast({
            type: 'update',
            payload: {
                updates: [...this.pending.values()],
            },
        });
        this.pending.clear();
    }
    broadcast(message: unknown) {
        const payload = JSON.stringify(message);
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }
    clientCount() {
        return this.clients.size;
    }
    close() {
        for (const client of this.clients) {
            client.close();
        }
        this.clients.clear();
        this.wss.close();
    }
}
</file>
<file path="src/utils/CircularBuffer.ts">
export class CircularBuffer<T> {
    private readonly buffer: (T | undefined)[];
    private head = 0;
    private length = 0;
    constructor(private readonly capacity: number) {
        this.buffer = new Array(capacity);
    }
    push(value: T) {
        this.buffer[this.head] = value;
        this.head = (this.head + 1) % this.capacity;
        if (this.length < this.capacity) {
            this.length++;
        }
    }
    toArray(): T[] {
        const result: T[] = [];
        const start =
            (this.head - this.length + this.capacity) %
            this.capacity;
        for (let i = 0; i < this.length; i++) {
            result.push(
                this.buffer[(start + i) % this.capacity]!,
            );
        }
        return result;
    }
    latest(): T | undefined {
        if (this.length === 0) return undefined;
        return this.buffer[
            (this.head - 1 + this.capacity) %
            this.capacity
        ];
    }
    size() {
        return this.length;
    }
    clear() {
        this.head = 0;
        this.length = 0;
    }
}
</file>
<file path="src/application.ts">
import { env } from "./config/env.ts";
import { FinnhubProvider } from "./providers/finnhub/FinnhubProvider.ts";
import { RealtimeServer } from "./server/realtimeServer.ts";
import { AnalyticsService } from "./services/AnalyticsService.ts";
import { MarketStore } from "./store/MarketStore.ts";
export class Application {
    private readonly store = new MarketStore(env.symbols);
    private readonly analytics = new AnalyticsService();
    private readonly provider = new FinnhubProvider();
    private readonly realtime = new RealtimeServer(env.port);
    private flushTimer?: NodeJS.Timeout;
    private heartbeatTimer?: NodeJS.Timeout;
    start() {
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
        this.provider.disconnect();
        this.realtime.close();
        console.log('MarketOps Backend stopped.');
    }
}
</file>
<file path="stock trades/opencollection.yml">
opencollection: 1.0.0
info:
  name: stock trades
bundled: false
extensions:
  bruno:
    ignore:
      - node_modules
      - .git
</file>
<file path="architecture.svg">
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="2347pt" height="1042pt"
 viewBox="0.00 0.00 2347.00 1042.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(36 1006.42)">
<title>MarketOps</title>
<polygon fill="white" stroke="none" points="-36,36 -36,-1006.42 2311,-1006.42 2311,36 -36,36"/>
<text xml:space="preserve" text-anchor="middle" x="1137.5" y="-951.22" font-family="Segoe UI" font-size="16.00" fill="#333333">MarketOps Backend Architecture</text>
<g id="clust1" class="cluster">
<title>cluster_entry</title>
<polygon fill="#e8f4fd" stroke="#90caf9" points="1480,-819.25 1480,-931.92 1656,-931.92 1656,-819.25 1480,-819.25"/>
<text xml:space="preserve" text-anchor="middle" x="1568" y="-912.72" font-family="Segoe UI" font-size="16.00" fill="#333333">Entry</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_app</title>
<polygon fill="#fff3e0" stroke="#ffb74d" points="1499,-704.75 1499,-789.25 1637,-789.25 1637,-704.75 1499,-704.75"/>
<text xml:space="preserve" text-anchor="middle" x="1568" y="-770.05" font-family="Segoe UI" font-size="16.00" fill="#333333">Application Layer</text>
</g>
<g id="clust3" class="cluster">
<title>cluster_config</title>
<polygon fill="#e8f5e9" stroke="#81c784" points="1712,-335.5 1712,-495 2103,-495 2103,-335.5 1712,-335.5"/>
<text xml:space="preserve" text-anchor="middle" x="1907.5" y="-475.8" font-family="Segoe UI" font-size="16.00" fill="#333333">Configuration</text>
</g>
<g id="clust4" class="cluster">
<title>cluster_providers</title>
<polygon fill="#fce4ec" stroke="#f48fb1" points="788,-357.5 788,-674.75 1704,-674.75 1704,-357.5 788,-357.5"/>
<text xml:space="preserve" text-anchor="middle" x="1246" y="-655.55" font-family="Segoe UI" font-size="16.00" fill="#333333">Data Providers</text>
</g>
<g id="clust5" class="cluster">
<title>cluster_finnhub</title>
<polygon fill="#f8bbd0" stroke="#ec407a" points="796,-365.5 796,-636.25 986,-636.25 986,-365.5 796,-365.5"/>
<text xml:space="preserve" text-anchor="middle" x="891" y="-617.05" font-family="Segoe UI" font-size="16.00" fill="#333333">Finnhub Provider</text>
</g>
<g id="clust6" class="cluster">
<title>cluster_legacy_providers</title>
<polygon fill="#ffebee" stroke="#e57373" stroke-dasharray="5,2" points="1013,-544.25 1013,-628.75 1696,-628.75 1696,-544.25 1013,-544.25"/>
<text xml:space="preserve" text-anchor="middle" x="1354.5" y="-609.55" font-family="Segoe UI" font-size="16.00" fill="#333333">Legacy (deprecated)</text>
</g>
<g id="clust7" class="cluster">
<title>cluster_store</title>
<polygon fill="#ede7f6" stroke="#b39ddb" points="179,-23 179,-293.75 341,-293.75 341,-23 179,-23"/>
<text xml:space="preserve" text-anchor="middle" x="260" y="-274.55" font-family="Segoe UI" font-size="16.00" fill="#333333">State Management</text>
</g>
<g id="clust8" class="cluster">
<title>cluster_services</title>
<polygon fill="#e0f7fa" stroke="#80deea" points="636,-350.5 636,-480 780,-480 780,-350.5 636,-350.5"/>
<text xml:space="preserve" text-anchor="middle" x="708" y="-460.8" font-family="Segoe UI" font-size="16.00" fill="#333333">Services</text>
</g>
<g id="clust9" class="cluster">
<title>cluster_server</title>
<polygon fill="#fbe9e7" stroke="#ffab91" points="2111,-186.75 2111,-472.5 2267,-472.5 2267,-186.75 2111,-186.75"/>
<text xml:space="preserve" text-anchor="middle" x="2189" y="-453.3" font-family="Segoe UI" font-size="16.00" fill="#333333">Server / Networking</text>
</g>
<g id="clust10" class="cluster">
<title>cluster_types</title>
<polygon fill="#f3e5f5" stroke="#ce93d8" points="402,-8 402,-137.5 832,-137.5 832,-8 402,-8"/>
<text xml:space="preserve" text-anchor="middle" x="617" y="-118.3" font-family="Segoe UI" font-size="16.00" fill="#333333">Type Definitions</text>
</g>
<g id="clust11" class="cluster">
<title>cluster_schemas</title>
<polygon fill="#f1f8e9" stroke="#aed581" stroke-dasharray="5,2" points="118,-544.25 118,-628.75 551,-628.75 551,-544.25 118,-544.25"/>
<text xml:space="preserve" text-anchor="middle" x="334.5" y="-609.55" font-family="Segoe UI" font-size="16.00" fill="#333333">Schemas — Zod (empty placeholders)</text>
</g>
<g id="clust12" class="cluster">
<title>cluster_routes</title>
<polygon fill="#fff9c4" stroke="#fff176" stroke-dasharray="5,2" points="8,-704.75 8,-789.25 524,-789.25 524,-704.75 8,-704.75"/>
<text xml:space="preserve" text-anchor="middle" x="266" y="-770.05" font-family="Segoe UI" font-size="16.00" fill="#333333">Routes — HTTP (empty placeholders)</text>
</g>
<g id="clust13" class="cluster">
<title>cluster_external</title>
<polygon fill="#eceff1" stroke="#b0bec5" points="1221,-187.12 1221,-285.88 1785,-285.88 1785,-187.12 1221,-187.12"/>
<text xml:space="preserve" text-anchor="middle" x="1503" y="-266.68" font-family="Segoe UI" font-size="16.00" fill="#333333">External Services / Libraries</text>
</g>
<g id="node1" class="node">
<title>index</title>
<polygon fill="#1976d2" stroke="black" stroke-width="1.2" points="1643.96,-848.29 1643.96,-872.38 1599.46,-889.42 1536.54,-889.42 1492.04,-872.38 1492.04,-848.29 1536.54,-831.25 1599.46,-831.25 1643.96,-848.29"/>
<polygon fill="none" stroke="black" stroke-width="1.2" points="1647.96,-845.54 1647.96,-875.13 1600.2,-893.42 1535.8,-893.42 1488.04,-875.13 1488.04,-845.54 1535.8,-827.25 1600.2,-827.25 1647.96,-845.54"/>
<text xml:space="preserve" text-anchor="middle" x="1568" y="-864.88" font-family="Segoe UI" font-size="11.00" fill="white">index.ts</text>
<text xml:space="preserve" text-anchor="middle" x="1568" y="-849.88" font-family="Segoe UI" font-size="11.00" fill="white">Application Entry</text>
</g>
<g id="node2" class="node">
<title>application</title>
<polygon fill="#f57c00" stroke="black" stroke-width="1.2" points="1622.12,-750.75 1513.88,-750.75 1513.88,-712.75 1622.12,-712.75 1622.12,-750.75"/>
<text xml:space="preserve" text-anchor="middle" x="1568" y="-736.3" font-family="Segoe UI" font-size="11.00" fill="white">Application</text>
<text xml:space="preserve" text-anchor="middle" x="1568" y="-721.3" font-family="Segoe UI" font-size="11.00" fill="white">(main orchestrator)</text>
</g>
<g id="edge1" class="edge">
<title>index&#45;&gt;application</title>
<path fill="none" stroke="#1976d2" stroke-width="2" d="M1568,-826.74C1568,-807.4 1568,-783.02 1568,-763.94"/>
<polygon fill="#1976d2" stroke="#1976d2" stroke-width="2" points="1571.5,-764.16 1568,-754.16 1564.5,-764.16 1571.5,-764.16"/>
</g>
<g id="node3" class="node">
<title>env</title>
<polygon fill="#43a047" stroke="black" stroke-width="1.2" points="1910,-426.5 1720,-426.5 1720,-373.5 1910,-373.5 1910,-426.5"/>
<text xml:space="preserve" text-anchor="middle" x="1815" y="-412.05" font-family="Segoe UI" font-size="11.00" fill="white">env.ts</text>
<text xml:space="preserve" text-anchor="middle" x="1815" y="-397.05" font-family="Segoe UI" font-size="11.00" fill="white">Environment Config</text>
<text xml:space="preserve" text-anchor="middle" x="1815" y="-382.05" font-family="Segoe UI" font-size="11.00" fill="white">(FINNHUB_TOKEN, PORT, SYMBOLS)</text>
</g>
<g id="edge2" class="edge">
<title>application&#45;&gt;env</title>
<path fill="none" stroke="#43a047" stroke-dasharray="5,2" d="M1622.55,-719.48C1650.59,-711.23 1683.49,-697.4 1706,-674.75 1772.28,-608.04 1799.58,-495.97 1809.7,-438.09"/>
<polygon fill="#43a047" stroke="#43a047" points="1813.12,-438.86 1811.31,-428.43 1806.21,-437.72 1813.12,-438.86"/>
<text xml:space="preserve" text-anchor="middle" x="1805.79" y="-569.08" font-family="Segoe UI" font-size="9.00">reads config</text>
</g>
<g id="node4" class="node">
<title>constants</title>
<polygon fill="#66bb6a" stroke="black" stroke-width="1.2" points="2095.38,-456.5 1952.62,-456.5 1952.62,-343.5 2095.38,-343.5 2095.38,-456.5"/>
<text xml:space="preserve" text-anchor="middle" x="2024" y="-442.05" font-family="Segoe UI" font-size="11.00" fill="white">constants/index.ts</text>
<text xml:space="preserve" text-anchor="middle" x="2024" y="-427.05" font-family="Segoe UI" font-size="11.00" fill="white">FLUSH_INTERVAL_MS</text>
<text xml:space="preserve" text-anchor="middle" x="2024" y="-412.05" font-family="Segoe UI" font-size="11.00" fill="white">STALE_THRESHOLD_MS</text>
<text xml:space="preserve" text-anchor="middle" x="2024" y="-397.05" font-family="Segoe UI" font-size="11.00" fill="white">HEARTBEAT_INTERVAL_MS</text>
<text xml:space="preserve" text-anchor="middle" x="2024" y="-382.05" font-family="Segoe UI" font-size="11.00" fill="white">MAX_HISTORY</text>
<text xml:space="preserve" text-anchor="middle" x="2024" y="-367.05" font-family="Segoe UI" font-size="11.00" fill="white">MAX_BACKOFF_MS</text>
<text xml:space="preserve" text-anchor="middle" x="2024" y="-352.05" font-family="Segoe UI" font-size="11.00" fill="white">PROTOCOL_VERSION</text>
</g>
<g id="edge3" class="edge">
<title>application&#45;&gt;constants</title>
<path fill="none" stroke="#43a047" stroke-dasharray="5,2" d="M1622.7,-731.32C1681.18,-729.4 1774.34,-718.81 1840,-674.75 1915.56,-624.05 1968.21,-530.81 1997.28,-467.39"/>
<polygon fill="#43a047" stroke="#43a047" points="2000.38,-469.02 2001.29,-458.46 1994,-466.15 2000.38,-469.02"/>
</g>
<g id="node5" class="node">
<title>finnhub_provider</title>
<polygon fill="#e91e63" stroke="black" stroke-width="1.2" points="978.12,-597.75 803.88,-597.75 803.88,-544.75 978.12,-544.75 978.12,-597.75"/>
<text xml:space="preserve" text-anchor="middle" x="891" y="-583.3" font-family="Segoe UI" font-size="11.00" fill="white">FinnhubProvider.ts</text>
<text xml:space="preserve" text-anchor="middle" x="891" y="-568.3" font-family="Segoe UI" font-size="11.00" fill="white">WebSocket Client</text>
<text xml:space="preserve" text-anchor="middle" x="891" y="-553.3" font-family="Segoe UI" font-size="11.00" fill="white">Implements MarketDataProvider</text>
</g>
<g id="edge6" class="edge">
<title>application&#45;&gt;finnhub_provider</title>
<path fill="none" stroke="#e91e63" stroke-width="1.5" d="M1513.49,-729.7C1390.17,-726.63 1093.46,-715.14 1003,-674.75 969.58,-659.83 939.46,-630.93 918.89,-607.62"/>
<polygon fill="#e91e63" stroke="#e91e63" stroke-width="1.5" points="921.6,-605.39 912.43,-600.07 916.28,-609.94 921.6,-605.39"/>
</g>
<g id="node12" class="node">
<title>market_store</title>
<polygon fill="#5c6bc0" stroke="black" stroke-width="1.2" points="333.25,-255.25 186.75,-255.25 186.75,-187.25 333.25,-187.25 333.25,-255.25"/>
<text xml:space="preserve" text-anchor="middle" x="260" y="-240.8" font-family="Segoe UI" font-size="11.00" fill="white">MarketStore.ts</text>
<text xml:space="preserve" text-anchor="middle" x="260" y="-225.8" font-family="Segoe UI" font-size="11.00" fill="white">SymbolState Map</text>
<text xml:space="preserve" text-anchor="middle" x="260" y="-210.8" font-family="Segoe UI" font-size="11.00" fill="white">Snapshot, Append, Update</text>
<text xml:space="preserve" text-anchor="middle" x="260" y="-195.8" font-family="Segoe UI" font-size="11.00" fill="white">MarkStale/MarkAlive</text>
</g>
<g id="edge4" class="edge">
<title>application&#45;&gt;market_store</title>
<path fill="none" stroke="#5c6bc0" stroke-width="1.5" d="M1513.48,-729.56C1335.6,-725.36 779.45,-709.56 707,-674.75 655.74,-650.12 397.54,-372.14 298.63,-264.48"/>
<polygon fill="#5c6bc0" stroke="#5c6bc0" stroke-width="1.5" points="301.28,-262.18 291.94,-257.18 296.12,-266.92 301.28,-262.18"/>
</g>
<g id="node14" class="node">
<title>analytics</title>
<polygon fill="#00acc1" stroke="black" stroke-width="1.2" points="771.88,-441.5 644.12,-441.5 644.12,-358.5 771.88,-358.5 771.88,-441.5"/>
<text xml:space="preserve" text-anchor="middle" x="708" y="-427.05" font-family="Segoe UI" font-size="11.00" fill="white">AnalyticsService.ts</text>
<text xml:space="preserve" text-anchor="middle" x="708" y="-412.05" font-family="Segoe UI" font-size="11.00" fill="white">processTrade()</text>
<text xml:space="preserve" text-anchor="middle" x="708" y="-397.05" font-family="Segoe UI" font-size="11.00" fill="white">&#45; VWAP calculation</text>
<text xml:space="preserve" text-anchor="middle" x="708" y="-382.05" font-family="Segoe UI" font-size="11.00" fill="white">&#45; High/Low tracking</text>
<text xml:space="preserve" text-anchor="middle" x="708" y="-367.05" font-family="Segoe UI" font-size="11.00" fill="white">&#45; Change % calculation</text>
</g>
<g id="edge5" class="edge">
<title>application&#45;&gt;analytics</title>
<path fill="none" stroke="#00acc1" stroke-width="1.5" d="M1513.39,-730.4C1345.07,-728.85 842.18,-720.4 786,-674.75 720.47,-621.5 707.67,-517.39 706.4,-454.03"/>
<polygon fill="#00acc1" stroke="#00acc1" stroke-width="1.5" points="709.9,-454.16 706.31,-444.2 702.9,-454.23 709.9,-454.16"/>
</g>
<g id="node15" class="node">
<title>realtime</title>
<polygon fill="#e64a19" stroke="black" stroke-width="1.2" points="2250,-434 2138,-434 2138,-366 2250,-366 2250,-434"/>
<text xml:space="preserve" text-anchor="middle" x="2194" y="-419.55" font-family="Segoe UI" font-size="11.00" fill="white">RealtimeServer.ts</text>
<text xml:space="preserve" text-anchor="middle" x="2194" y="-404.55" font-family="Segoe UI" font-size="11.00" fill="white">WebSocket Server</text>
<text xml:space="preserve" text-anchor="middle" x="2194" y="-389.55" font-family="Segoe UI" font-size="11.00" fill="white">Client management</text>
<text xml:space="preserve" text-anchor="middle" x="2194" y="-374.55" font-family="Segoe UI" font-size="11.00" fill="white">Queue &amp; Flush</text>
</g>
<g id="edge7" class="edge">
<title>application&#45;&gt;realtime</title>
<path fill="none" stroke="#e64a19" stroke-width="1.5" d="M1622.38,-726.4C1709.58,-718.74 1876.25,-701.14 1929,-674.75 2035.75,-621.35 2123.68,-507.21 2166.28,-444.5"/>
<polygon fill="#e64a19" stroke="#e64a19" stroke-width="1.5" points="2169.04,-446.66 2171.7,-436.41 2163.23,-442.76 2169.04,-446.66"/>
</g>
<g id="node28" class="node">
<title>dotenv</title>
<polygon fill="#78909c" stroke="black" stroke-width="1.2" points="1490.25,-239.25 1403.75,-239.25 1403.75,-235.25 1399.75,-235.25 1399.75,-231.25 1403.75,-231.25 1403.75,-211.25 1399.75,-211.25 1399.75,-207.25 1403.75,-207.25 1403.75,-203.25 1490.25,-203.25 1490.25,-239.25"/>
<polyline fill="none" stroke="black" stroke-width="1.2" points="1403.75,-235.25 1407.75,-235.25 1407.75,-231.25 1403.75,-231.25"/>
<polyline fill="none" stroke="black" stroke-width="1.2" points="1403.75,-211.25 1407.75,-211.25 1407.75,-207.25 1403.75,-207.25"/>
<text xml:space="preserve" text-anchor="middle" x="1447" y="-218.3" font-family="Segoe UI" font-size="11.00" fill="white">dotenv/config</text>
</g>
<g id="edge22" class="edge">
<title>env&#45;&gt;dotenv</title>
<path fill="none" stroke="#78909c" stroke-dasharray="5,2" d="M1719.69,-378.9C1657.06,-362.68 1575.31,-335.56 1512,-293.75 1493.8,-281.73 1477.32,-263.48 1465.51,-248.42"/>
<polygon fill="#78909c" stroke="#78909c" points="1468.53,-246.61 1459.7,-240.75 1462.95,-250.84 1468.53,-246.61"/>
</g>
<g id="node16" class="node">
<title>protocol</title>
<polygon fill="#f4511e" stroke="black" stroke-width="1.2" points="2237,-247.75 2119,-247.75 2119,-194.75 2237,-194.75 2237,-247.75"/>
<text xml:space="preserve" text-anchor="middle" x="2178" y="-233.3" font-family="Segoe UI" font-size="11.00" fill="white">protocol.ts</text>
<text xml:space="preserve" text-anchor="middle" x="2178" y="-218.3" font-family="Segoe UI" font-size="11.00" fill="white">createMessage()</text>
<text xml:space="preserve" text-anchor="middle" x="2178" y="-203.3" font-family="Segoe UI" font-size="11.00" fill="white">Message sequencing</text>
</g>
<g id="edge20" class="edge">
<title>constants&#45;&gt;protocol</title>
<path fill="none" stroke="#66bb6a" stroke-dasharray="5,2" d="M2060.15,-342.93C2069.93,-329.03 2080.89,-314.48 2092,-301.75 2106.21,-285.46 2123.45,-268.99 2138.75,-255.3"/>
<polygon fill="#66bb6a" stroke="#66bb6a" points="2140.71,-258.24 2145.89,-249 2136.08,-252.99 2140.71,-258.24"/>
<text xml:space="preserve" text-anchor="middle" x="2134" y="-305.95" font-family="Segoe UI" font-size="9.00">PROTOCOL_VERSION</text>
</g>
<g id="edge10" class="edge">
<title>finnhub_provider&#45;&gt;env</title>
<path fill="none" stroke="#43a047" stroke-dasharray="5,2" d="M978.46,-548.39C986.72,-546.8 994.99,-545.38 1003,-544.25 1245.38,-510.11 1314.8,-572.1 1553,-515.75 1627.75,-498.07 1707.83,-459.86 1759.5,-432.38"/>
<polygon fill="#43a047" stroke="#43a047" points="1760.96,-435.57 1768.11,-427.76 1757.64,-429.41 1760.96,-435.57"/>
<text xml:space="preserve" text-anchor="middle" x="1620.78" y="-507.2" font-family="Segoe UI" font-size="9.00">reads token</text>
</g>
<g id="node6" class="node">
<title>finnhub_types</title>
<polygon fill="#c2185b" stroke="black" stroke-width="1.2" points="945,-426.5 821,-426.5 821,-373.5 945,-373.5 945,-426.5"/>
<text xml:space="preserve" text-anchor="middle" x="883" y="-412.05" font-family="Segoe UI" font-size="11.00" fill="white">FinnhubTypes.ts</text>
<text xml:space="preserve" text-anchor="middle" x="883" y="-397.05" font-family="Segoe UI" font-size="11.00" fill="white">FinnhubTradeMessage</text>
<text xml:space="preserve" text-anchor="middle" x="883" y="-382.05" font-family="Segoe UI" font-size="11.00" fill="white">FinnhubPingMessage</text>
</g>
<g id="edge9" class="edge">
<title>finnhub_provider&#45;&gt;finnhub_types</title>
<path fill="none" stroke="#c2185b" d="M889.77,-544.18C888.42,-515.77 886.27,-470.09 884.75,-437.98"/>
<polygon fill="#c2185b" stroke="#c2185b" points="888.26,-438.16 884.29,-428.34 881.27,-438.49 888.26,-438.16"/>
</g>
<g id="node7" class="node">
<title>base_provider</title>
<polygon fill="#880e4f" stroke="black" stroke-width="1.2" points="1152.25,-426.5 993.75,-426.5 993.75,-373.5 1152.25,-373.5 1152.25,-426.5"/>
<text xml:space="preserve" text-anchor="middle" x="1073" y="-412.05" font-family="Segoe UI" font-size="11.00" fill="white">BaseProviders.ts</text>
<text xml:space="preserve" text-anchor="middle" x="1073" y="-397.05" font-family="Segoe UI" font-size="11.00" fill="white">MarketDataProvider Interface</text>
<text xml:space="preserve" text-anchor="middle" x="1073" y="-382.05" font-family="Segoe UI" font-size="11.00" fill="white">TradeEvent Interface</text>
</g>
<g id="edge8" class="edge">
<title>finnhub_provider&#45;&gt;base_provider</title>
<path fill="none" stroke="#880e4f" stroke-dasharray="5,2" d="M928.59,-544.38C947.7,-530.56 970.86,-512.78 990,-495 1009.74,-476.66 1029.79,-454.09 1045.24,-435.66"/>
<polygon fill="#880e4f" stroke="#880e4f" points="1047.78,-438.08 1051.46,-428.15 1042.39,-433.61 1047.78,-438.08"/>
<text xml:space="preserve" text-anchor="middle" x="1002.85" y="-507.2" font-family="Segoe UI" font-size="9.00">implements</text>
</g>
<g id="node27" class="node">
<title>finnhub_api</title>
<path fill="#546e7a" stroke="black" stroke-width="1.2" d="M1361.12,-242.62C1361.12,-245.25 1331.49,-247.38 1295,-247.38 1258.51,-247.38 1228.88,-245.25 1228.88,-242.62 1228.88,-242.62 1228.88,-199.88 1228.88,-199.88 1228.88,-197.25 1258.51,-195.12 1295,-195.12 1331.49,-195.12 1361.12,-197.25 1361.12,-199.88 1361.12,-199.88 1361.12,-242.62 1361.12,-242.62"/>
<path fill="none" stroke="black" stroke-width="1.2" d="M1361.12,-242.62C1361.12,-240 1331.49,-237.88 1295,-237.88 1258.51,-237.88 1228.88,-240 1228.88,-242.62"/>
<text xml:space="preserve" text-anchor="middle" x="1295" y="-225.8" font-family="Segoe UI" font-size="11.00" fill="white">Finnhub WebSocket API</text>
<text xml:space="preserve" text-anchor="middle" x="1295" y="-210.8" font-family="Segoe UI" font-size="11.00" fill="white">(wss://ws.finnhub.io)</text>
</g>
<g id="edge11" class="edge">
<title>finnhub_provider&#45;&gt;finnhub_api</title>
<path fill="none" stroke="#546e7a" stroke-width="2" d="M978.54,-548.89C986.78,-547.19 995.03,-545.61 1003,-544.25 1059.64,-534.57 1219.2,-556.21 1260,-515.75 1328.03,-448.28 1315.44,-323.09 1303.65,-260.28"/>
<polygon fill="#546e7a" stroke="#546e7a" stroke-width="2" points="1307.15,-259.95 1301.76,-250.83 1300.28,-261.32 1307.15,-259.95"/>
<text xml:space="preserve" text-anchor="middle" x="1335.1" y="-397.82" font-family="Segoe UI" font-size="9.00">WebSocket</text>
</g>
<g id="node29" class="node">
<title>ws_lib</title>
<polygon fill="#78909c" stroke="black" stroke-width="1.2" points="1642.5,-239.25 1533.5,-239.25 1533.5,-235.25 1529.5,-235.25 1529.5,-231.25 1533.5,-231.25 1533.5,-211.25 1529.5,-211.25 1529.5,-207.25 1533.5,-207.25 1533.5,-203.25 1642.5,-203.25 1642.5,-239.25"/>
<polyline fill="none" stroke="black" stroke-width="1.2" points="1533.5,-235.25 1537.5,-235.25 1537.5,-231.25 1533.5,-231.25"/>
<polyline fill="none" stroke="black" stroke-width="1.2" points="1533.5,-211.25 1537.5,-211.25 1537.5,-207.25 1533.5,-207.25"/>
<text xml:space="preserve" text-anchor="middle" x="1588" y="-218.3" font-family="Segoe UI" font-size="11.00" fill="white">ws (WebSocket lib)</text>
</g>
<g id="edge12" class="edge">
<title>finnhub_provider&#45;&gt;ws_lib</title>
<path fill="none" stroke="#78909c" stroke-dasharray="5,2" d="M978.52,-548.78C986.77,-547.1 995.02,-545.56 1003,-544.25 1164.1,-517.83 1231.08,-585.43 1367,-495 1466.18,-429.01 1542.75,-304.78 1573.41,-249.72"/>
<polygon fill="#78909c" stroke="#78909c" points="1576.46,-251.44 1578.2,-240.99 1570.32,-248.08 1576.46,-251.44"/>
</g>
<g id="node8" class="node">
<title>finnhub_normalizer</title>
<polygon fill="#ef9a9a" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="1141.12,-590.25 1020.88,-590.25 1020.88,-552.25 1141.12,-552.25 1141.12,-590.25"/>
<text xml:space="preserve" text-anchor="middle" x="1081" y="-575.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">FinnhubNormalizer.ts</text>
<text xml:space="preserve" text-anchor="middle" x="1081" y="-560.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">(DEPRECATED)</text>
</g>
<g id="node9" class="node">
<title>market_provider</title>
<polygon fill="#ef9a9a" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="1323.88,-590.25 1184.12,-590.25 1184.12,-552.25 1323.88,-552.25 1323.88,-590.25"/>
<text xml:space="preserve" text-anchor="middle" x="1254" y="-575.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">market/MarketProvider.ts</text>
<text xml:space="preserve" text-anchor="middle" x="1254" y="-560.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">(DEPRECATED)</text>
</g>
<g id="node10" class="node">
<title>mock_provider</title>
<polygon fill="#ef9a9a" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="1499.5,-590.25 1366.5,-590.25 1366.5,-552.25 1499.5,-552.25 1499.5,-590.25"/>
<text xml:space="preserve" text-anchor="middle" x="1433" y="-575.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">market/MockProvider.ts</text>
<text xml:space="preserve" text-anchor="middle" x="1433" y="-560.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">(DEPRECATED)</text>
</g>
<g id="node11" class="node">
<title>old_finnhub</title>
<polygon fill="#ef9a9a" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="1687.5,-590.25 1542.5,-590.25 1542.5,-552.25 1687.5,-552.25 1687.5,-590.25"/>
<text xml:space="preserve" text-anchor="middle" x="1615" y="-575.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">market/FinnhubProvider.ts</text>
<text xml:space="preserve" text-anchor="middle" x="1615" y="-560.8" font-family="Segoe UI" font-size="11.00" fill="#880e4f">(DEPRECATED)</text>
</g>
<g id="edge30" class="edge">
<title>old_finnhub&#45;&gt;finnhub_types</title>
<path fill="none" stroke="#e57373" stroke-dasharray="5,2" d="M1552.87,-551.65C1542.3,-548.9 1531.38,-546.3 1521,-544.25 1370.36,-514.53 1331.08,-514.86 1178,-503 1152.62,-501.03 971.38,-507.13 949,-495 925.91,-482.48 909.1,-457.95 898.23,-437.09"/>
<polygon fill="#e57373" stroke="#e57373" points="901.45,-435.7 893.89,-428.26 895.16,-438.78 901.45,-435.7"/>
</g>
<g id="node13" class="node">
<title>circular_buffer</title>
<polygon fill="#7986cb" stroke="black" stroke-width="1.2" points="324.62,-84 195.38,-84 195.38,-31 324.62,-31 324.62,-84"/>
<text xml:space="preserve" text-anchor="middle" x="260" y="-69.55" font-family="Segoe UI" font-size="11.00" fill="white">CircularBuffer.ts</text>
<text xml:space="preserve" text-anchor="middle" x="260" y="-54.55" font-family="Segoe UI" font-size="11.00" fill="white">Fixed&#45;size ring buffer</text>
<text xml:space="preserve" text-anchor="middle" x="260" y="-39.55" font-family="Segoe UI" font-size="11.00" fill="white">toArray(), push(), latest()</text>
</g>
<g id="edge13" class="edge">
<title>market_store&#45;&gt;circular_buffer</title>
<path fill="none" stroke="#7986cb" stroke-width="1.5" d="M260,-186.74C260,-160.53 260,-124.09 260,-96.75"/>
<polygon fill="#7986cb" stroke="#7986cb" stroke-width="1.5" points="263.5,-96.79 260,-86.79 256.5,-96.79 263.5,-96.79"/>
</g>
<g id="node17" class="node">
<title>types_market</title>
<polygon fill="#8e24aa" stroke="black" stroke-width="1.2" points="509.62,-99 410.38,-99 410.38,-16 509.62,-16 509.62,-99"/>
<text xml:space="preserve" text-anchor="middle" x="460" y="-84.55" font-family="Segoe UI" font-size="11.00" fill="white">types/market.ts</text>
<text xml:space="preserve" text-anchor="middle" x="460" y="-69.55" font-family="Segoe UI" font-size="11.00" fill="white">SymbolState</text>
<text xml:space="preserve" text-anchor="middle" x="460" y="-54.55" font-family="Segoe UI" font-size="11.00" fill="white">PricePoint</text>
<text xml:space="preserve" text-anchor="middle" x="460" y="-39.55" font-family="Segoe UI" font-size="11.00" fill="white">TradeUpdate</text>
<text xml:space="preserve" text-anchor="middle" x="460" y="-24.55" font-family="Segoe UI" font-size="11.00" fill="white">SnapshotPayload</text>
</g>
<g id="edge14" class="edge">
<title>market_store&#45;&gt;types_market</title>
<path fill="none" stroke="#8e24aa" stroke-dasharray="5,2" d="M301.44,-186.74C330.31,-163.39 369.22,-131.92 401.28,-105.99"/>
<polygon fill="#8e24aa" stroke="#8e24aa" points="403.37,-108.8 408.94,-99.79 398.97,-103.36 403.37,-108.8"/>
</g>
<g id="edge16" class="edge">
<title>analytics&#45;&gt;market_store</title>
<path fill="none" stroke="#5c6bc0" stroke-dasharray="5,2" d="M650.75,-357.92C638.03,-349.83 624.35,-341.88 611,-335.5 523.77,-293.81 417.32,-261.9 344.68,-242.73"/>
<polygon fill="#5c6bc0" stroke="#5c6bc0" points="345.79,-239.41 335.23,-240.27 344.03,-246.18 345.79,-239.41"/>
<text xml:space="preserve" text-anchor="middle" x="591.82" y="-305.95" font-family="Segoe UI" font-size="9.00">reads SymbolState</text>
</g>
<g id="edge15" class="edge">
<title>analytics&#45;&gt;types_market</title>
<path fill="none" stroke="#8e24aa" stroke-dasharray="5,2" d="M678.78,-358.26C666.26,-340.83 651.44,-320.27 638,-301.75 589.34,-234.71 532.8,-157.57 496.73,-108.45"/>
<polygon fill="#8e24aa" stroke="#8e24aa" points="499.65,-106.52 490.91,-100.54 494.01,-110.67 499.65,-106.52"/>
<text xml:space="preserve" text-anchor="middle" x="650.32" y="-219.07" font-family="Segoe UI" font-size="9.00">uses types</text>
</g>
<g id="edge17" class="edge">
<title>realtime&#45;&gt;protocol</title>
<path fill="none" stroke="#f4511e" stroke-width="1.5" d="M2190.99,-365.75C2188.28,-335.78 2184.29,-291.73 2181.45,-260.35"/>
<polygon fill="#f4511e" stroke="#f4511e" stroke-width="1.5" points="2184.94,-260.07 2180.55,-250.43 2177.97,-260.7 2184.94,-260.07"/>
</g>
<g id="edge18" class="edge">
<title>realtime&#45;&gt;ws_lib</title>
<path fill="none" stroke="#78909c" stroke-dasharray="5,2" d="M2160.5,-365.69C2146.87,-354.14 2130.27,-342.37 2113,-335.5 1926.79,-261.39 1846.69,-376.17 1664,-293.75 1641.71,-283.69 1621.79,-264.36 1607.95,-248.33"/>
<polygon fill="#78909c" stroke="#78909c" points="1610.95,-246.47 1601.87,-241.01 1605.56,-250.94 1610.95,-246.47"/>
</g>
<g id="node18" class="node">
<title>types_protocol</title>
<polygon fill="#9c27b0" stroke="black" stroke-width="1.2" points="671.38,-91.5 552.62,-91.5 552.62,-23.5 671.38,-23.5 671.38,-91.5"/>
<text xml:space="preserve" text-anchor="middle" x="612" y="-77.05" font-family="Segoe UI" font-size="11.00" fill="white">types/protocol.ts</text>
<text xml:space="preserve" text-anchor="middle" x="612" y="-62.05" font-family="Segoe UI" font-size="11.00" fill="white">ServerMessage</text>
<text xml:space="preserve" text-anchor="middle" x="612" y="-47.05" font-family="Segoe UI" font-size="11.00" fill="white">MessageType</text>
<text xml:space="preserve" text-anchor="middle" x="612" y="-32.05" font-family="Segoe UI" font-size="11.00" fill="white">PROTOCOL_VERSION</text>
</g>
<g id="edge19" class="edge">
<title>protocol&#45;&gt;types_protocol</title>
<path fill="none" stroke="#9c27b0" stroke-dasharray="5,2" d="M2118.68,-214.27C2043.46,-206.87 1909.72,-194.33 1795,-186.75 1672.7,-178.67 805.47,-186.22 693,-137.5 674.17,-129.34 657.21,-114.68 643.74,-100.19"/>
<polygon fill="#9c27b0" stroke="#9c27b0" points="646.49,-98.01 637.23,-92.85 641.25,-102.65 646.49,-98.01"/>
<text xml:space="preserve" text-anchor="middle" x="819.06" y="-149.7" font-family="Segoe UI" font-size="9.00">uses types</text>
</g>
<g id="edge21" class="edge">
<title>types_market&#45;&gt;circular_buffer</title>
<path fill="none" stroke="#7986cb" stroke-dasharray="5,2" d="M409.84,-57.5C385.27,-57.5 360.7,-57.5 336.13,-57.5"/>
<polygon fill="#7986cb" stroke="#7986cb" points="336.36,-54 326.36,-57.5 336.36,-61 336.36,-54"/>
</g>
<g id="node19" class="node">
<title>types_websocket</title>
<polygon fill="#ab47bc" stroke="black" stroke-width="1.2" points="823.88,-84 714.12,-84 714.12,-31 823.88,-31 823.88,-84"/>
<text xml:space="preserve" text-anchor="middle" x="769" y="-69.55" font-family="Segoe UI" font-size="11.00" fill="white">types/websocket.ts</text>
<text xml:space="preserve" text-anchor="middle" x="769" y="-54.55" font-family="Segoe UI" font-size="11.00" fill="white">WSMessage</text>
<text xml:space="preserve" text-anchor="middle" x="769" y="-39.55" font-family="Segoe UI" font-size="11.00" fill="white">EventType</text>
</g>
<g id="node20" class="node">
<title>schema_market</title>
<polygon fill="#c5e1a5" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="232,-590.25 126,-590.25 126,-552.25 232,-552.25 232,-590.25"/>
<text xml:space="preserve" text-anchor="middle" x="179" y="-575.8" font-family="Segoe UI" font-size="11.00" fill="#689f38">schemas/market.ts</text>
<text xml:space="preserve" text-anchor="middle" x="179" y="-560.8" font-family="Segoe UI" font-size="11.00" fill="#689f38">(empty)</text>
</g>
<g id="edge23" class="edge">
<title>schema_market&#45;&gt;types_market</title>
<path fill="none" stroke="#c5e1a5" stroke-dasharray="5,2" d="M191.49,-551.94C221.02,-508.29 296.73,-394.23 351,-293.75 384.41,-231.89 417.62,-157.95 438.45,-109.69"/>
<polygon fill="#c5e1a5" stroke="#c5e1a5" points="441.63,-111.16 442.36,-100.59 435.19,-108.39 441.63,-111.16"/>
</g>
<g id="node21" class="node">
<title>schema_protocol</title>
<polygon fill="#c5e1a5" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="390.5,-590.25 275.5,-590.25 275.5,-552.25 390.5,-552.25 390.5,-590.25"/>
<text xml:space="preserve" text-anchor="middle" x="333" y="-575.8" font-family="Segoe UI" font-size="11.00" fill="#689f38">schemas/protocol.ts</text>
<text xml:space="preserve" text-anchor="middle" x="333" y="-560.8" font-family="Segoe UI" font-size="11.00" fill="#689f38">(empty)</text>
</g>
<g id="edge25" class="edge">
<title>schema_protocol&#45;&gt;types_protocol</title>
<path fill="none" stroke="#c5e1a5" stroke-dasharray="5,2" d="M371.77,-551.7C389.33,-542.28 409.74,-529.85 426,-515.75 512.31,-440.87 542.93,-420.34 586,-314.5 614.41,-244.68 616.67,-155.68 614.9,-103.12"/>
<polygon fill="#c5e1a5" stroke="#c5e1a5" points="618.41,-103.2 614.5,-93.35 611.41,-103.49 618.41,-103.2"/>
</g>
<g id="node22" class="node">
<title>schema_finnhub</title>
<polygon fill="#c5e1a5" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="542.88,-590.25 433.12,-590.25 433.12,-552.25 542.88,-552.25 542.88,-590.25"/>
<text xml:space="preserve" text-anchor="middle" x="488" y="-575.8" font-family="Segoe UI" font-size="11.00" fill="#689f38">schemas/finnhub.ts</text>
<text xml:space="preserve" text-anchor="middle" x="488" y="-560.8" font-family="Segoe UI" font-size="11.00" fill="#689f38">(empty)</text>
</g>
<g id="edge24" class="edge">
<title>schema_finnhub&#45;&gt;finnhub_types</title>
<path fill="none" stroke="#c5e1a5" stroke-dasharray="5,2" d="M543.4,-565.51C606.64,-558.12 711.46,-539.71 790,-495 816.24,-480.06 840.07,-455.66 857.04,-435.46"/>
<polygon fill="#c5e1a5" stroke="#c5e1a5" points="859.53,-437.94 863.14,-427.99 854.11,-433.51 859.53,-437.94"/>
</g>
<g id="node23" class="node">
<title>route_candles</title>
<polygon fill="#fff59d" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="114.25,-750.75 15.75,-750.75 15.75,-712.75 114.25,-712.75 114.25,-750.75"/>
<text xml:space="preserve" text-anchor="middle" x="65" y="-736.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">routes/candles.ts</text>
<text xml:space="preserve" text-anchor="middle" x="65" y="-721.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">(empty)</text>
</g>
<g id="edge26" class="edge">
<title>route_candles&#45;&gt;schema_market</title>
<path fill="none" stroke="#fff59d" stroke-dasharray="5,2" d="M78.3,-712.26C98.21,-684.58 135.89,-632.19 159.09,-599.94"/>
<polygon fill="#fff59d" stroke="#fff59d" points="161.9,-602.02 164.9,-591.85 156.22,-597.93 161.9,-602.02"/>
</g>
<g id="node24" class="node">
<title>route_quote</title>
<polygon fill="#fff59d" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="248.5,-750.75 157.5,-750.75 157.5,-712.75 248.5,-712.75 248.5,-750.75"/>
<text xml:space="preserve" text-anchor="middle" x="203" y="-736.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">routes/quote.ts</text>
<text xml:space="preserve" text-anchor="middle" x="203" y="-721.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">(empty)</text>
</g>
<g id="edge27" class="edge">
<title>route_quote&#45;&gt;schema_market</title>
<path fill="none" stroke="#fff59d" stroke-dasharray="5,2" d="M200.2,-712.26C196.08,-685.06 188.35,-633.99 183.45,-601.62"/>
<polygon fill="#fff59d" stroke="#fff59d" points="186.97,-601.48 182.01,-592.12 180.05,-602.53 186.97,-601.48"/>
</g>
<g id="node25" class="node">
<title>route_profile</title>
<polygon fill="#fff59d" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="386.38,-750.75 291.62,-750.75 291.62,-712.75 386.38,-712.75 386.38,-750.75"/>
<text xml:space="preserve" text-anchor="middle" x="339" y="-736.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">routes/profile.ts</text>
<text xml:space="preserve" text-anchor="middle" x="339" y="-721.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">(empty)</text>
</g>
<g id="edge28" class="edge">
<title>route_profile&#45;&gt;schema_market</title>
<path fill="none" stroke="#fff59d" stroke-dasharray="5,2" d="M305.11,-712.26C288.67,-702.37 269.23,-689.25 254,-674.75 230.7,-652.57 209.6,-622.38 195.76,-600.51"/>
<polygon fill="#fff59d" stroke="#fff59d" points="198.79,-598.76 190.54,-592.1 192.84,-602.45 198.79,-598.76"/>
</g>
<g id="node26" class="node">
<title>route_news</title>
<polygon fill="#fff59d" stroke="black" stroke-width="1.2" stroke-dasharray="5,2" points="516.25,-750.75 429.75,-750.75 429.75,-712.75 516.25,-712.75 516.25,-750.75"/>
<text xml:space="preserve" text-anchor="middle" x="473" y="-736.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">routes/news.ts</text>
<text xml:space="preserve" text-anchor="middle" x="473" y="-721.3" font-family="Segoe UI" font-size="11.00" fill="#f57f17">(empty)</text>
</g>
<g id="edge29" class="edge">
<title>route_news&#45;&gt;schema_finnhub</title>
<path fill="none" stroke="#fff59d" stroke-dasharray="5,2" d="M474.75,-712.26C477.31,-685.18 482.11,-634.44 485.18,-602.05"/>
<polygon fill="#fff59d" stroke="#fff59d" points="488.66,-602.42 486.12,-592.13 481.69,-601.76 488.66,-602.42"/>
</g>
<g id="node30" class="node">
<title>zod_lib</title>
<polygon fill="#78909c" stroke="black" stroke-width="1.2" points="1776.88,-239.25 1685.12,-239.25 1685.12,-235.25 1681.12,-235.25 1681.12,-231.25 1685.12,-231.25 1685.12,-211.25 1681.12,-211.25 1681.12,-207.25 1685.12,-207.25 1685.12,-203.25 1776.88,-203.25 1776.88,-239.25"/>
<polyline fill="none" stroke="black" stroke-width="1.2" points="1685.12,-235.25 1689.12,-235.25 1689.12,-231.25 1685.12,-231.25"/>
<polyline fill="none" stroke="black" stroke-width="1.2" points="1685.12,-211.25 1689.12,-211.25 1689.12,-207.25 1685.12,-207.25"/>
<text xml:space="preserve" text-anchor="middle" x="1731" y="-218.3" font-family="Segoe UI" font-size="11.00" fill="white">zod (validation)</text>
</g>
</g>
</svg>
</file>
<file path="folder_structure.md">
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
</file>
<file path="src/config/env.ts">
import 'dotenv/config';
const token = process.env.FINNHUB_TOKEN;
if (!token) {
    throw new Error('FINNHUB_TOKEN is missing.');
}
export const env = {
    finnhubToken: token,
    port: Number(process.env.PORT ?? 8080),
    symbols: (process.env.SYMBOLS ??
        'AAPL,MSFT,BINANCE:BTCUSDT')
        .split(',')
        .map((s) => s.trim())
};
</file>
<file path="src/constants/index.ts">
export const FLUSH_INTERVAL_MS = 300;
export const STALE_THRESHOLD_MS = 15_000;
export const HEARTBEAT_INTERVAL_MS = 5_000;
export const MAX_HISTORY = 500;
export const MAX_BACKOFF_MS = 30_000;
export const PROTOCOL_VERSION = '1.0.0';
</file>
<file path="src/providers/finnhub/FinnhubProvider.ts">
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
</file>
<file path="src/providers/finnhub/FinnhubTypes.ts">
export interface FinnhubTrade {
    p: number; // price
    s: string; // symbol
    t: number; // timestamp
    v: number; // volume
    c?: string[];
}
export interface FinnhubTradeMessage {
    type: 'trade';
    data: FinnhubTrade[];
}
export interface FinnhubPingMessage {
    type: 'ping';
}
export type FinnhubMessage =
    | FinnhubTradeMessage
    | FinnhubPingMessage;
</file>
<file path="src/server/protocol.ts">
import { PROTOCOL_VERSION, ServerMessage } from '../types/protocol.ts';
let sequence = 0;
export function createMessage<T>(
    type: ServerMessage<T>['type'],
    payload: T,
): ServerMessage<T> {
    sequence += 1;
    return {
        version: PROTOCOL_VERSION,
        sequence,
        timestamp: Date.now(),
        type,
        payload,
    };
}
</file>
<file path="src/services/AnalyticsService.ts">
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
</file>
<file path="src/store/MarketStore.ts">
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
</file>
<file path="src/types/market.ts">
export interface PricePoint {
  timestamp: number;
  price: number;
}
export interface SymbolState {
  symbol: string;
  companyName: string;
  exchange: string;
  sector?: string;
  currentPrice: number;
  previousClose: number;
  absoluteChange: number;
  percentChange: number;
  totalVolume: number;
  tradeCount: number;
  high: number;
  low: number;
  open: number;
  vwap: number;
  lastTradeTimestamp: number;
  stale: boolean;
  history: PricePoint[];
}
export interface TradeUpdate {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  lastTradeTimestamp: number;
}
export interface SnapshotPayload {
  symbols: Record<string, SymbolState>;
}
export interface UpdatePayload {
  updates: TradeUpdate[];
}
export interface StalePayload {
  symbols: string[];
}
export interface HeartbeatPayload {
  uptime: number;
  connectedClients: number;
  providerConnected: boolean;
}
</file>
<file path="src/types/protocol.ts">
export const PROTOCOL_VERSION = '1.0.0' as const;
export type MessageType =
    | 'snapshot'
    | 'update'
    | 'stale'
    | 'heartbeat'
    | 'system'
    | 'error.ts';
export interface ServerMessage<T> {
    version: typeof PROTOCOL_VERSION;
    sequence: number;
    timestamp: number;
    type: MessageType;
    payload: T;
}
</file>
<file path="src/types/websocket.ts">
export type EventType =
    | 'snapshot'
    | 'update'
    | 'stale'
    | 'heartbeat'
    | 'connection'
    | 'error.ts';
export interface WSMessage<T> {
    version: '1.0.ts';
    sequence: number;
    timestamp: number;
    type: EventType;
    payload: T;
}
</file>
<file path="src/index.ts">
import { Application } from "./application.ts";
const app = new Application();
app.start();
// Handles Ctrl+C, Docker stop, Railway, Render, Kubernetes, etc.
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    app.stop();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\nGracefully shutting down...');
    app.stop();
    process.exit(0);
});
</file>
<file path=".env.example">
FINNHUB_TOKEN=YOUR_FINNHUB_API_KEY
PORT=8080
SYMBOLS=AAPL,MSFT,NVDA,AMZN,TSLA,BINANCE:BTCUSDT
</file>
<file path=".gitignore">
.env
.graphify
node_modules/
</file>
<file path="biome.json">
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    }
  }
}
</file>
<file path="package.json">
{
  "name": "marketops-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "dotenv": "^16.6.1",
    "finnhub": "^2.0.0",
    "ws": "^8.18.3",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@types/ws": "^8.18.1",
    "tsx": "^4.20.5",
    "typescript": "^5.9.2"
  }
}
</file>
<file path="pnpm-workspace.yaml">
allowBuilds:
  esbuild: true
  protobufjs: set this to true or false
  tesseract.js: set this to true or false
  tree-sitter-c: set this to true or false
  tree-sitter-cpp: set this to true or false
  tree-sitter-go: set this to true or false
  tree-sitter-java: set this to true or false
  tree-sitter-javascript: set this to true or false
  tree-sitter-lua: set this to true or false
  tree-sitter-php: set this to true or false
  tree-sitter-python: set this to true or false
  tree-sitter-ruby: set this to true or false
  tree-sitter-rust: set this to true or false
  tree-sitter-typescript: set this to true or false
</file>
<file path="tsconfig.json">
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowImportingTsExtensions": true,
    "noEmit":true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src"]
}
</file>
</files>
```

## File: src/config/env.ts

```typescript
import "dotenv/config";
const token = process.env.FINNHUB_TOKEN;
if (!token) {
  throw new Error("FINNHUB_TOKEN is missing.");
}
export const env = {
  finnhubToken: token,
  port: Number(process.env.PORT ?? 8080),
  symbols: (process.env.SYMBOLS ?? "AAPL,MSFT,BINANCE:BTCUSDT")
    .split(",")
    .map((s) => s.trim()),
};
```

## File: src/constants/index.ts

```typescript
export const FLUSH_INTERVAL_MS = 300;
export const STALE_THRESHOLD_MS = 15_000;
export const HEARTBEAT_INTERVAL_MS = 5_000;
export const MAX_HISTORY = 500;
export const MAX_BACKOFF_MS = 30_000;
export const PROTOCOL_VERSION = "1.0.0";
```

## File: src/providers/finnhub/FinnhubProvider.ts

```typescript
import WebSocket from "ws";
import { env } from "../../config/env.ts";
import type { MarketDataProvider, TradeEvent } from "../BaseProviders.ts";
const MAX_BACKOFF = 30000;
export class FinnhubProvider implements MarketDataProvider {
  private socket?: WebSocket;
  private reconnectAttempt = 0;
  private symbols: string[] = [];
  private listeners = new Set<(trade: TradeEvent) => void>();
  connect() {
    this.socket = new WebSocket(
      `wss://ws.finnhub.io?token=${env.finnhubToken}`,
    );
    this.socket.on("open", () => {
      this.reconnectAttempt = 0;
      this.subscribe(this.symbols);
      console.log("Finnhub Connected");
    });
    this.socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.type !== "trade") return;
      for (const trade of message.data) {
        const normalized: TradeEvent = {
          symbol: trade.s,
          price: trade.p,
          volume: trade.v,
          timestamp: trade.t,
        };
        this.listeners.forEach((listener) => {
          listener(normalized);
        });
      }
    });
    this.socket.on("close", () => {
      this.reconnect();
    });
    this.socket.on("error", console.error);
  }
  disconnect() {
    this.socket?.close();
  }
  subscribe(symbols: string[]) {
    this.symbols = symbols;
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    for (const symbol of symbols) {
      this.socket.send(
        JSON.stringify({
          type: "subscribe",
          symbol,
        }),
      );
    }
  }
  onTrade(listener: (trade: TradeEvent) => void) {
    this.listeners.add(listener);
  }
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  private reconnect() {
    this.reconnectAttempt++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, MAX_BACKOFF);
    console.log(`Reconnect in ${delay} ms`);
    setTimeout(() => this.connect(), delay);
  }
}
```

## File: src/providers/finnhub/FinnhubTypes.ts

```typescript
export interface FinnhubTrade {
  p: number;
  s: string;
  t: number;
  v: number;
  c?: string[];
}
export interface FinnhubTradeMessage {
  type: "trade";
  data: FinnhubTrade[];
}
export interface FinnhubPingMessage {
  type: "ping";
}
export type FinnhubMessage = FinnhubTradeMessage | FinnhubPingMessage;
```

## File: src/server/protocol.ts

```typescript
import { PROTOCOL_VERSION, ServerMessage } from "../types/protocol.ts";
let sequence = 0;
export function createMessage<T>(
  type: ServerMessage<T>["type"],
  payload: T,
): ServerMessage<T> {
  sequence += 1;
  return {
    version: PROTOCOL_VERSION,
    sequence,
    timestamp: Date.now(),
    type,
    payload,
  };
}
```

## File: src/services/AnalyticsService.ts

```typescript
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
  processTrade(state: SymbolState, trade: TradeEvent): AnalyticsResult {
    const previousClose = state.previousClose ?? trade.price;
    const absoluteChange = trade.price - previousClose;
    const percentChange =
      previousClose === 0 ? 0 : (absoluteChange / previousClose) * 100;
    const totalVolume = state.totalVolume + trade.volume;
    const tradeCount = state.tradeCount + 1;
    const high =
      state.high === null ? trade.price : Math.max(state.high, trade.price);
    const low =
      state.low === null ? trade.price : Math.min(state.low, trade.price);
    const previousWeightedPrice = state.vwap * state.totalVolume;
    const weightedPrice = previousWeightedPrice + trade.price * trade.volume;
    const vwap = totalVolume === 0 ? trade.price : weightedPrice / totalVolume;
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
```

## File: src/store/MarketStore.ts

```typescript
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
        history: new CircularBuffer<PricePoint>(MAX_HISTORY),
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
      [...this.symbols.entries()].map(([symbol, state]) => [
        symbol,
        {
          ...state,
          history: state.history.toArray(),
        },
      ]),
    );
  }
  update(symbol: string, update: Partial<SymbolState>) {
    const state = this.symbols.get(symbol);
    if (!state) return;
    Object.assign(state, update);
  }
  appendHistory(symbol: string, point: PricePoint) {
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
```

## File: src/types/market.ts

```typescript
export interface PricePoint {
  timestamp: number;
  price: number;
}
export interface SymbolState {
  symbol: string;
  companyName: string;
  exchange: string;
  sector?: string;
  currentPrice: number;
  previousClose: number;
  absoluteChange: number;
  percentChange: number;
  totalVolume: number;
  tradeCount: number;
  high: number;
  low: number;
  open: number;
  vwap: number;
  lastTradeTimestamp: number;
  stale: boolean;
  history: PricePoint[];
}
export interface TradeUpdate {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  lastTradeTimestamp: number;
}
export interface SnapshotPayload {
  symbols: Record<string, SymbolState>;
}
export interface UpdatePayload {
  updates: TradeUpdate[];
}
export interface StalePayload {
  symbols: string[];
}
export interface HeartbeatPayload {
  uptime: number;
  connectedClients: number;
  providerConnected: boolean;
}
```

## File: src/types/protocol.ts

```typescript
export const PROTOCOL_VERSION = "1.0.0" as const;
export type MessageType =
  | "snapshot"
  | "update"
  | "stale"
  | "heartbeat"
  | "system"
  | "error.ts";
export interface ServerMessage<T> {
  version: typeof PROTOCOL_VERSION;
  sequence: number;
  timestamp: number;
  type: MessageType;
  payload: T;
}
```

## File: src/types/websocket.ts

```typescript
export type EventType =
  | "snapshot"
  | "update"
  | "stale"
  | "heartbeat"
  | "connection"
  | "error.ts";
export interface WSMessage<T> {
  version: "1.0.ts";
  sequence: number;
  timestamp: number;
  type: EventType;
  payload: T;
}
```

## File: src/index.ts

```typescript
import { Application } from "./application.ts";
const app = new Application();
app.start();
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down...");
  app.stop();
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\nGracefully shutting down...");
  app.stop();
  process.exit(0);
});
```

## File: .env.example

```
FINNHUB_TOKEN=YOUR_FINNHUB_API_KEY

PORT=8080

SYMBOLS=AAPL,MSFT,NVDA,AMZN,TSLA,BINANCE:BTCUSDT
```

## File: .gitignore

```
.env
.graphify
node_modules/
```

## File: biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    }
  }
}
```

## File: package.json

```json
{
  "name": "marketops-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "dotenv": "^16.6.1",
    "finnhub": "^2.0.15",
    "ws": "^8.18.3",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@types/ws": "^8.18.1",
    "tsx": "^4.20.5",
    "typescript": "^5.9.2"
  }
}
```

## File: pnpm-workspace.yaml

```yaml
allowBuilds:
  esbuild: true
  protobufjs: set this to true or false
  tesseract.js: set this to true or false
  tree-sitter-c: set this to true or false
  tree-sitter-cpp: set this to true or false
  tree-sitter-go: set this to true or false
  tree-sitter-java: set this to true or false
  tree-sitter-javascript: set this to true or false
  tree-sitter-lua: set this to true or false
  tree-sitter-php: set this to true or false
  tree-sitter-python: set this to true or false
  tree-sitter-ruby: set this to true or false
  tree-sitter-rust: set this to true or false
  tree-sitter-typescript: set this to true or false
```

## File: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src"]
}
```
