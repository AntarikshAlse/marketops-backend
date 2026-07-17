import 'dotenv/config.ts';

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