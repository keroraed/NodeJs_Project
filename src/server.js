import http from "http";
import app from "./app.js";
import connectDB from "./core/database/db.js";
import appConfig from "./core/config/app.config.js";
import logger from "./core/logger/logger.js";
import initializeSocket from "./core/socket/socket.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    // Initialise Socket.IO on the same HTTP server
    const io = initializeSocket(server);

    // Make io accessible from request handlers if needed
    app.set("io", io);

    server.listen(appConfig.port, () => {
      logger.info(
        `Server running in ${appConfig.nodeEnv} mode on port ${appConfig.port}`,
      );
      logger.info(`API available at http://localhost:${appConfig.port}/api`);
      logger.info(`WebSocket server available on the same port`);
    });

    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

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
