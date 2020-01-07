import { env, Provider } from "@msiviero/knit";
import { createLogger, format, Logger, transports } from "winston";

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

export class LoggerProvider implements Provider<Logger> {

    constructor(@env("LOG_LEVEL", "debug") private readonly logLevel: string) { }

    public provide = () => createLogger({
        level: this.logLevel,
        transports: [
            process.env.NODE_ENV === "production"
                ? productionTransport
                : developmentTransport,
        ],
    })
}
