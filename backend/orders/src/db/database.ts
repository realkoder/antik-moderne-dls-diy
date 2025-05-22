import { PrismaClient } from "@prisma/client";

const prismaOrders = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local" ? "postgresql://postgres:admin@postgresdb:5432/orders" : "postgresql://postgres:admin@localhost:5431/orders",
    },
  },
});

export { prismaOrders };
