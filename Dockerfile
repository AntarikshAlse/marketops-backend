# ========================== dockerfile ==========================
# Stage 1 - Build
# ==========================
FROM node:22-alpine AS builder

WORKDIR /workspace

# Copy dependency configuration files
COPY package*.json ./

# Install all development and production dependencies for building
RUN npm ci

# Copy configuration and local source code files
COPY tsconfig.json ./
COPY src ./src

# Runs 'tsc' to compile TypeScript into Javascript
RUN npm run build


# ==========================
# Stage 2 - Production
# ==========================
FROM node:22-alpine

WORKDIR /workspace

# ---------- Build Arguments ----------
ARG FINNHUB_TOKEN
ARG SYMBOLS=AAPL,MSFT,NVDA,AMZN,TSLA,BINANCE:BTCUSDT
ARG PORT=8080

# ---------- Environment Variables ----------
ENV NODE_ENV=production
ENV FINNHUB_TOKEN=${FINNHUB_TOKEN}
ENV SYMBOLS=${SYMBOLS}
ENV PORT=${PORT}

# Copy package configurations for production setup
COPY package*.json ./

# Install strictly production dependencies to keep the image lightweight
RUN npm ci --only=production

# Copy the compiled JavaScript files from the builder stage
COPY --from=builder /workspace/dist ./dist

# Document target port for Google Cloud Run
EXPOSE ${PORT}

# Uses 'node dist/index.js' as defined in your package.json start script
CMD ["npm", "start"]