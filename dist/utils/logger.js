"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/logger.ts
const winston_1 = __importDefault(require("winston"));
const devFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message }) => {
    return `[${level}] ${message}`;
}));
const prodFormat = winston_1.default.format.json();
const logger = winston_1.default.createLogger({
    level: "info",
    format: process.env.NODE_ENV === "development" ? devFormat : prodFormat,
    transports: [new winston_1.default.transports.Console()],
});
exports.default = logger;
