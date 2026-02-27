import sequelize from "./mysql";

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate().then(() => {
      console.log("Connection Successfull");
    });

    await sequelize.sync().then(() => {
      console.log("Database Sync");
    });
  } catch (err) {
    console.error(
      "Unable to connect to the database or synchronize models:",
      err
    );
  }
};

export default initializeDatabase;
