# Stage 1: Build Dependencies (MUST BE NAMED 'AS builder')
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Hardened Runtime
FROM node:20-alpine
WORKDIR /app

RUN apk update && apk upgrade --no-cache

# COPY references Stage 1 ('builder')
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

COPY . .

RUN chown -R node:node /app
USER node

VOLUME /tmp

EXPOSE 3000
CMD ["node", "server.js"]