import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, "../logs");

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LogLevel = {
  INFO: "INFO",
  ERROR: "ERROR",
  WARN: "WARN",
  DEBUG: "DEBUG",
  SECURITY: "SECURITY", // For security-critical events
};

/**
 * Logger utility for structured logging
 * Logs to console and file system
 */
export const logger = {
  log: (level, message, metadata = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    // Format for console
    const consoleOutput = `[${timestamp}] [${level}] ${message}`;
    console.log(consoleOutput);

    // Write to appropriate log file
    const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
    fs.appendFileSync(
      logFile,
      JSON.stringify(logMessage) + "\n",
      { encoding: "utf-8" }
    );

    // Also write security events to security.log
    if (level === LogLevel.SECURITY) {
      const securityFile = path.join(logsDir, "security.log");
      fs.appendFileSync(
        securityFile,
        JSON.stringify(logMessage) + "\n",
        { encoding: "utf-8" }
      );
    }
  },

  info: (message, metadata) =>
    logger.log(LogLevel.INFO, message, metadata),
  error: (message, metadata) =>
    logger.log(LogLevel.ERROR, message, metadata),
  warn: (message, metadata) =>
    logger.log(LogLevel.WARN, message, metadata),
  debug: (message, metadata) =>
    logger.log(LogLevel.DEBUG, message, metadata),
  security: (message, metadata) =>
    logger.log(LogLevel.SECURITY, message, metadata),
};

export default logger;
