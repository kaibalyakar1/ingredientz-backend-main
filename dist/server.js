"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const app_1 = __importDefault(require("./app"));
const server = http_1.default.createServer(app_1.default);
mongoose_1.default
    .connect(config_1.default.mongoUri, {
// options
})
    .then(() => {
    logger_1.default.info("Connected to MongoDB");
    server.listen(config_1.default.port, () => {
        logger_1.default.info(`Server started on port ${config_1.default.port}`);
    });
})
    .catch((err) => {
    logger_1.default.error("MongoDB connection error", err);
    process.exit(1);
});
// graceful shutdown
const shutdown = () => {
    logger_1.default.info("Shutting down gracefully...");
    server.close(() => {
        mongoose_1.default.disconnect().then(() => {
            logger_1.default.info("Mongo disconnected");
            process.exit(0);
        });
    });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
const PORT = process.env.PORT || 3000;
