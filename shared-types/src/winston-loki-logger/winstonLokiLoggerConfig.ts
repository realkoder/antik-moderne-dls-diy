import { Request, Response, NextFunction } from 'express';
import { createLogger, transports, format, Logger } from "winston"
import LokiTransport from "winston-loki"

// Followed this guide - logging with winston and sending all response loggings to loki to be displayed inside grafana
// At grafana dashboard added with loki as datasoruce with query: {app=~".*-service"}
// https://grafana.com/blog/2022/07/07/how-to-configure-grafana-loki-with-a-node.js-e-commerce-app/

let logger: Logger

const initializeLogger = (appName: string) => {
    if (logger) {
        return
    }

    logger = createLogger({
        transports: [new LokiTransport({
            host: "http://loki:3100",
            labels: { app: appName },
            json: true,
            format: format.json(),
            replaceTimestamp: true,
            onConnectionError: (err) => console.error(err)
        }),
        // Uncomment to add console outputs
        // new transports.Console({
        //     format: format.combine(format.simple(), format.colorize())
        // })
    ]
    })
}

const getLogger = (appName: string) => {
    initializeLogger(appName)
    return logger
}

export const logResponseMiddleware = (appName: string, req: Request, res: Response, next: NextFunction) => {
    const logger = getLogger(appName);
    const { method, url } = req;

    res.on('finish', () => {
        const status = res.statusCode;
        logger.info({ message: `method=${method} url=${url} status=${status}`, labels: { 'origin': 'api' } });
    });

    next();
};