import { config } from "@/helpers/infra/global-config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  config.db.database!,
  config.db.user!,
  config.db.password!,
  {
    host: config.db.host!,
    port: config.db.port!,
    dialect: config.db.dialect!,
    logging: true,
  }
);

export default sequelize;
