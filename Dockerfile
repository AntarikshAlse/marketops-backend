# ----------------------------
# Stage 1 - Build
# ----------------------------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

# ----------------------------
# Stage 2 - Production
# ----------------------------
FROM node:22-alpine

WORKDIR /src

ENV NODE_ENV=production

COPY package*.json ./

RUN pnpm install --omit=dev

COPY --from=builder /src/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]