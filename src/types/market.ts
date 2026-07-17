export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface SymbolState {
  symbol: string;

  price: number | null;

  change: number;

  volume: number;

  lastTradeTimestamp: number | null;

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