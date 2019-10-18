import { createLogger, format, transports } from "winston";
import { ApplicationConfig } from "./config";

const formats = [
  format.prettyPrint(),
  format.timestamp(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
];

const developmentTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    ...formats,
  ),
});

const productionTransport = new transports.Console({
  format: format.combine(
    ...formats,
  ),
});

export const logger = createLogger({
  level: ApplicationConfig.LOG_LEVEL,
  transports: [
    process.env.NODE_ENV === "production"
      ? productionTransport
      : developmentTransport,
  ],
});
