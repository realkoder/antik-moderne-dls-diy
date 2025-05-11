import { PrismaClient } from "@prisma/client";

const prismaProducts = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local" ? "postgresql://postgres:admin@postgresdb:5432/products" : "postgresql://postgres:admin@localhost:5431/products",
    },
  },
});

export { prismaProducts };
