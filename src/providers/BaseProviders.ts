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
    isConnecting(): boolean;
}