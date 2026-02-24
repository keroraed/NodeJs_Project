const app = require("./app");
const connectDB = require("./core/database/db");
const appConfig = require("./core/config/app.config");
const logger = require("./core/logger/logger");

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start HTTP server
    const server = app.listen(appConfig.port, () => {
      logger.info(
        `Server running in ${appConfig.nodeEnv} mode on port ${appConfig.port}`,
      );
      logger.info(`API available at http://localhost:${appConfig.port}/api`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
