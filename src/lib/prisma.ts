import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL is not set. Please add it to your .env file.\n"
    );
}

// Create Prisma adapter with connection string
const adapter = new PrismaMariaDb(databaseUrl);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
