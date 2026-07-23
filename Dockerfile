# ==========================
# Stage 1 - Build
# ==========================
FROM node:26-alpine AS builder

WORKDIR /src

COPY package*.json ./

RUN pnpm install

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build


# ==========================
# Stage 2 - Production
# ==========================
FROM node:26-alpine

WORKDIR /src

# ---------- Build Arguments ----------
ARG FINNHUB_TOKEN
ARG PORT=8080
ARG SYMBOLS=AAPL,MSFT,NVDA,AMZN,TSLA,BINANCE:BTCUSDT

# ---------- Environment Variables ----------
ENV NODE_ENV=production
ENV FINNHUB_TOKEN=${FINNHUB_TOKEN}
ENV PORT=${PORT}
ENV SYMBOLS=${SYMBOLS}

COPY package*.json ./

RUN pnpm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE ${PORT}

CMD ["node", "dist/index.js"]