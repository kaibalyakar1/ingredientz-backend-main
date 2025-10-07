import http from "http";
import mongoose from "mongoose";
import config from "./config";
import logger from "./utils/logger";
import app from "./app";

const server = http.createServer(app);

mongoose
  .connect(config.mongoUri, {
    // options
  })
  .then(() => {
    logger.info("Connected to MongoDB");
    server.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  });

// graceful shutdown
const shutdown = () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    mongoose.disconnect().then(() => {
      logger.info("Mongo disconnected");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

const PORT = process.env.PORT || 3000;
