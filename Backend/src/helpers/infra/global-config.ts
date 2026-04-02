import dotenv from "dotenv";
import { Dialect } from "sequelize";
import { Config } from "@/interfaces/config-interface.js";
dotenv.config({ path: ".env" });

export const config: Config = {
  app: {
    nodeEnv: process.env.NODE_ENV ?? "development",
  },
  express: {
    port: process.env.EXPRESS_PORT ?? process.env.PORT ?? "3000",
    host: process.env.EXPRESS_HOST ?? "localhost",
  },
  prisma: {
    databaseUrl: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  db: {
    database: process.env.MYSQL_DEV,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT
      ? parseInt(process.env.MYSQL_PORT, 10)
      : undefined,
    dialect: process.env.MYSQL_DIALECT as Dialect,
  },
  key: {
    jwtSecret: process.env.JWT_SECRET,
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY,
  },
};
