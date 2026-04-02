import { Dialect } from "sequelize";

interface ExpressConfig {
  port?: string;
  host?: string;
}

interface DbConfig {
  database?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  dialect?: Dialect;
}

interface KeyConfig {
  jwtSecret?: string;
  privateKey?: string;
  publicKey?: string;
}

interface PrismaConfig {
  databaseUrl?: string;
  directUrl?: string;
}

interface AppConfig {
  nodeEnv?: string;
}

export interface Config {
  express: ExpressConfig;
  db: DbConfig;
  key: KeyConfig;
  prisma: PrismaConfig;
  app: AppConfig;
}
