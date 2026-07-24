# ==========================
# Stage 1 - Build
# ==========================
FROM node:24-alpine AS builder

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package*.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build


# ==========================
# Stage 2 - Production
# ==========================
FROM node:24-alpine

# Enable corepack to use pnpm in production stage
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ---------- Build Arguments ----------
ARG FINNHUB_TOKEN
ARG SYMBOLS=AAPL,MSFT,NVDA,AMZN,TSLA,BINANCE:BTCUSDT
ARG PORT=8080

# ---------- Environment Variables ----------
ENV NODE_ENV=production
ENV FINNHUB_TOKEN=${FINNHUB_TOKEN}
ENV SYMBOLS=${SYMBOLS}
ENV PORT=${PORT}

COPY package*.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Corrected source path from "/app/dist"
COPY --from=builder /app/dist ./dist

# Cloud Run injects PORT automatically, but we expose it for local testing
EXPOSE ${PORT}

CMD ["node", "dist/index.js"]
