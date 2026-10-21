import winston from "winston";
import path from "path";

const LOG_DIR = path.join(import.meta.dirname, "logs");

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  transports: [
    // 1. Консоль
    new winston.transports.Console(),
    // 2. Файл со логами
    new winston.transports.File({
      filename: path.join(LOG_DIR, "info.log"),
      level: "info",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  ],

  exitOnError: false,
});
