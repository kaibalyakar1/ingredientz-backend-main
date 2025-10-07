// src/utils/logger.ts
import winston from "winston";

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message }) => {
    return `[${level}] ${message}`;
  })
);

const prodFormat = winston.format.json();

const logger = winston.createLogger({
  level: "info",
  format: process.env.NODE_ENV === "development" ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
});

export default logger;
