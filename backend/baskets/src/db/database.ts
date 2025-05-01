import { PrismaClient } from "@prisma/client";

const prismaBaskets = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:admin@postgres:5432/baskets",
    },
  },
});

export { prismaBaskets };
