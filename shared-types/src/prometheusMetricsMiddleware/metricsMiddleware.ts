// shared-types/src/metricsMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Collect default metrics
promClient.collectDefaultMetrics();

// Counter for total HTTP requests
const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route'],
});

// Histogram for tracking request duration
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
});

// Histogram for tracking request lengths in bytes
const httpResponseLength = new promClient.Histogram({
    name: 'http_response_length_bytes',
    help: 'Length of HTTP responses in bytes',
    labelNames: ['method', 'route'],
});

// Middleware to count requests
export const requestCounterMiddleware = (req: Request, _: Response, next: NextFunction) => {
    httpRequestCounter.inc({ method: req.method, route: req.path });
    next();
};

// Middleware to measure response length
export const responseLengthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function (body) {
        // Convert body to string if it's an object
        if (typeof body !== 'string' && !Buffer.isBuffer(body)) {
            body = JSON.stringify(body);
        }
        const responseLength = Buffer.byteLength(body);
        httpResponseLength.observe({ method: req.method, route: req.path }, responseLength);
        return originalSend.call(this, body);
    };
    next();
};

// Middleware to measure request duration
export const requestDurationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.path, status: res.statusCode });
    });
    next();
};