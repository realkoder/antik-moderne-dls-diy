import { PrismaClient } from "@prisma/client";

const prismaUsers = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:admin@postgres:5432/users",
    },
  },
});

export { prismaUsers };
