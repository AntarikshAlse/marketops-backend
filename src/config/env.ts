import 'dotenv/config';
import fs from 'fs';

// 1. Check if the environment variable exists first (for local dev fallback)
let token = process.env.FINNHUB_TOKEN;

// 2. Define your target Cloud Run secret volume mount directory path
const SECRET_VOLUME_PATH = '/app/secrets/finnhub_token/FINNHUB_TOKEN';

// 3. Fallback to reading the mounted volume file if it exists at runtime
if (!token && fs.existsSync(SECRET_VOLUME_PATH)) {
    token = fs.readFileSync(SECRET_VOLUME_PATH, 'utf8').trim();
}

// 4. Validate that the token was safely resolved from one of the sources
if (!token) {
    throw new Error('FINNHUB_TOKEN is missing from both env and mounted volume.');
}

export const env = {
    finnhubToken: token,
    port: Number(process.env.PORT ?? 8080),
    symbols: (process.env.SYMBOLS ?? 'AAPL,MSFT,BINANCE:BTCUSDT')
        .split(',')
        .map((s) => s.trim())
};
