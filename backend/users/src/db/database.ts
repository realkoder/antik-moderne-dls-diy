import { PrismaClient } from "@prisma/client";

const prismaUsers = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local" ? "postgresql://postgres:admin@postgresdb:5432/users" : "postgresql://postgres:admin@localhost:5431/users",
    },
  },
});

export { prismaUsers };
