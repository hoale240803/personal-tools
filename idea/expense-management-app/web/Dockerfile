# Web Dockerfile — multi-stage build
# Stage 1: build Vite/React app
# Stage 2: serve with Nginx (lightweight static server)

# ── Stage 1: Builder ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY api/package.json ./api/
COPY web/package.json ./web/

# Install all dependencies
RUN npm install

# Copy web source
COPY web/ ./web/

# Build Vite app → web/dist/
RUN npm run build

# ── Stage 2: Nginx static server ─────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config for SPA (react-router fallback)
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
