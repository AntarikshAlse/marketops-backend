# ==========================
# Stage 1 - Build
# ==========================
FROM node:24-alpine AS builder

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy all configuration and lockfiles over
COPY package*.json pnpm-lock.yaml* .npmrc* pnpm-workspace.yaml* ./

# FIXED: Explicitly force pnpm to allow esbuild scripts directly via CLI
RUN pnpm install --dangerously-allow-all-builds

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build
RUN pnpm prune --prod



# ==========================
# Stage 2 - Production
# ==========================
FROM node:24-alpine
WORKDIR /app

# Non-sensitive configuration fallback defaults are safe to keep here
ARG SYMBOLS=AAPL,MSFT,NVDA,AMZN,TSLA,BINANCE:BTCUSDT
ARG PORT=8080

ENV NODE_ENV=production
ENV SYMBOLS=${SYMBOLS}
ENV PORT=${PORT}

# REMOVED: FINNHUB_TOKEN ARG and ENV blocks are completely gone

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE ${PORT}
CMD ["node", "dist/index.js"]