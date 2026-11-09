# API Dockerfile — multi-stage build
# Stage 1: install & compile TypeScript
# Stage 2: lean production image (no dev deps, no source)

# ── Stage 1: Builder ──────────────────────────────────────────────────────
FROM node:24.22.1-alpine AS builder

RUN apk update && apk upgrade --no-cache ca-certificates

WORKDIR /app

# Copy package files for dependency install
COPY package.json package-lock.json ./
COPY api/package.json ./api/
COPY web/package.json ./web/

# Install all dependencies (including devDeps needed for tsc)
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY api/ ./api/

# Compile TypeScript → dist/
RUN cd api && npm run build

# ── Stage 2: Production runner ────────────────────────────────────────────
FROM node:24.22.1-alpine AS runner

RUN apk update && apk upgrade --no-cache ca-certificates

WORKDIR /app

ENV NODE_ENV=production

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy production package files and install only prod deps
COPY package.json package-lock.json ./
COPY api/package.json ./api/

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "dist/api/server.js"]
