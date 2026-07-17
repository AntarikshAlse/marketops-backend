export interface MarketProvider {
    connect(): Promise<void>;

    disconnect(): void;

    subscribe(symbols: string[]): void;

    onMessage(
        listener: (message: unknown) => void
    ): void;
}