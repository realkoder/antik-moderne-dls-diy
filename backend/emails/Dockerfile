FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build

FROM node:23-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Security best practices - adding a simple user instead of relying on sudo admin
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app  # Change ownership

USER appuser

ENV NODE_ENV=kubernetes-local
ENV PORT=3003

RUN npm install --only=production

CMD ["node", "dist/index.js"]