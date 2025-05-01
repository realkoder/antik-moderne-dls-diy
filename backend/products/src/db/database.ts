import { PrismaClient } from "@prisma/client";

const prismaProducts = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:admin@postgres:5432/products",
    },
  },
});

export { prismaProducts };
