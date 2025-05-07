# build cmd: docker build -t antik-moderne-baskets-service:latest ./backend/baskets
# run cmd: docker run -d -p 3002:3002 --name antik-moderne-baskets-service antik-moderne-baskets-service:latest 

FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build

FROM node:23-alpine AS production
RUN npx prisma generate --schema=./src/db/schema.prisma

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Security best practices - adding a simple user instead of relying on sudo admin
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app  # Change ownership

USER appuser

ENV NODE_ENV=kubernetes-local
ENV PORT=3002

RUN npm install --only=production

CMD ["node", "dist/index.js"]