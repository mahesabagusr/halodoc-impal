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
  privateKey?: string;
  publicKey?: string;
}

export interface Config {
  express: ExpressConfig;
  db: DbConfig;
  key: KeyConfig;
}
