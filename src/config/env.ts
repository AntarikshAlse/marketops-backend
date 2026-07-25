import 'dotenv/config';

// Cloud Run injects this directly from Secret Manager into process.env!
// const token = process.env.FINNHUB_TOKEN;

// if (!token) {
//     throw new Error('FINNHUB_TOKEN environment variable is missing.');
// }

export const env = {
    // finnhubToken: token,
    port: Number(process.env.PORT ?? 8080),
    symbols: (process.env.SYMBOLS ?? 'AAPL,MSFT,BINANCE:BTCUSDT')
        .split(',')
        .map((s) => s.trim())
};
