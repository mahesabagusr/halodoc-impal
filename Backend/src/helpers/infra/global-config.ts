import dotenv from "dotenv";
import { Dialect } from "sequelize";
import { Config } from "@/interfaces/config-interface.js";
dotenv.config({ path: ".env" });

export const config: Config = {
  express: {
    port: process.env.EXPRESS_PORT,
    host: process.env.EXPRESS_HOST,
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
    publicKey: process.env.PUBLIC_KEY_PATH,
    privateKey: process.env.PRIVATE_KEY_PATH,
  },
};
