import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "@/helpers/infra/global-config";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const databaseUrl = config.prisma.databaseUrl;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString: databaseUrl,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      config.app.nodeEnv === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (config.app.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPool = pool;
}

export default prisma;
