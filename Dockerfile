# ==========================
# Stage 1 - Base (Install everything needed to build)
# ==========================
FROM node:24-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy dependency configuration files AND lockfile
COPY package*.json pnpm-lock.yaml* .npmrc* ./

# Install ALL dependencies (including devDependencies like typescript, esbuild)
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

# ==========================
# Stage 2 - Build
# ==========================
FROM base AS builder
WORKDIR /app

# Copy the rest of your application source code
COPY tsconfig.json ./
COPY src ./src

# Compile the TypeScript files into your /app/dist directory
RUN pnpm run build

# ==========================
# Stage 3 - Production Runtime
# ==========================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the compiled JavaScript files from the builder stage
COPY --from=builder /app/dist ./dist
# FIXED: Copy the package files AND the pnpm lockfile into the runner stage
COPY --from=builder /app/package*.json /app/pnpm-lock.yaml* ./

# Perform a clean install of ONLY production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod --frozen-lockfile --dangerously-allow-all-builds

# Expose port documentation for Cloud Run
EXPOSE 8080

# Execute the runtime script safely
CMD ["node", "dist/index.js"]
