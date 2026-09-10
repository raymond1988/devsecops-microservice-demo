FROM node:20-alpine
WORKDIR /app
# Upgrade system packages to patch Alpine OS vulnerabilities
RUN apk update && apk upgrade --no-cache
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "server.js"]