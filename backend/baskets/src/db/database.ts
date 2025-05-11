import { PrismaClient } from "@prisma/client";

const prismaBaskets = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local" ? "postgresql://postgres:admin@postgresdb:5432/baskets" : "postgresql://postgres:admin@localhost:5431/baskets",
    },
  },
});

export { prismaBaskets };
