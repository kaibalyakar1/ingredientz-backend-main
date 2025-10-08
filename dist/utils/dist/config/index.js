"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: +(process.env.PORT || 8080),
    mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/my_store_db",
    jwtSecret: process.env.JWT_SECRET || "changeme",
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        adminNotification: process.env.ADMIN_NOTIFICATION_EMAIL,
    },
    rateLimit: {
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
        max: Number(process.env.RATE_LIMIT_MAX || 100),
    },
};
