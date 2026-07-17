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