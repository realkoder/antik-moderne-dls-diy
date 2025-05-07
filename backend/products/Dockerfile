# build cmd: docker build -t antik-moderne-products-service:latest ./backend/products
# run cmd: docker run -d -p 3004:3004 --name antik-moderne-products-service antik-moderne-products-service:latest 

FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build
RUN npx prisma generate --schema=./src/db/schema.prisma

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
ENV PORT=3004

RUN npm install --only=production

CMD ["node", "dist/index.js"]