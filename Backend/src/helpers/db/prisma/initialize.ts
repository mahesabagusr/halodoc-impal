import prisma from "./client";
import logger from "@/helpers/utils/winston";

const initializePrisma = async () => {
  try {
    await prisma.$connect();
    logger.info("Prisma connected successfully");
    console.log("Database connection established");
  } catch (err) {
    logger.error("Unable to connect to the database:", err);
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default initializePrisma;
