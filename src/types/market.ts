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