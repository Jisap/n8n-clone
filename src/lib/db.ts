import { PrismaClient } from "@/generated/prisma/client";


const globalForPrisma = global as unknown as { prisma:PrismaClient }; // Define the global variable

const prisma = globalForPrisma.prisma || new PrismaClient();          // Use the global variable or create a new one

if (process.env.NODE_ENV !== "production") {                          // Only create the prisma client in development
  globalForPrisma.prisma = prisma;
}

export default prisma;

