# Stage 1: Dependency Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Hardened Runtime Environment
FROM node:20-alpine
WORKDIR /app

# Upgrade Alpine OS packages
RUN apk update && apk upgrade --no-cache

# Copy pre-pruned node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy application source code
COPY . .

# Assign non-root permissions
RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "server.js"]