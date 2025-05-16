import express from "express";
import promClient from "prom-client";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import basketsRouter from "./routers/basketsRouter.js";
import { requestCounterMiddleware, requestDurationMiddleware, responseLengthMiddleware } from "@realkoder/antik-moderne-shared-types";

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());

// ============================
// Config metrics to Prometheus
// ============================
// promClient.collectDefaultMetrics();

// // Counter for total HTTP requests
// const httpRequestCounter = new promClient.Counter({
//     name: 'http_requests_total',
//     help: 'Total number of HTTP requests',
//     labelNames: ['method', 'route'],
// });

// // Histogram for tracking request duration
// const httpRequestDuration = new promClient.Histogram({
//     name: 'http_request_duration_seconds',
//     help: 'Duration of HTTP requests in seconds',
//     labelNames: ['method', 'route', 'status'],
// });

// // Histogram for tracking request lengths in bytes
// const httpResponseLength = new promClient.Histogram({
//     name: 'http_response_length_bytes',
//     help: 'Length of HTTP responses in bytes',
//     labelNames: ['method', 'route'],
// });

// // Middleware to count requests
// app.use((req, _, next) => {
//     httpRequestCounter.inc({ method: req.method, route: req.path });
//     next();
// });

//    // Middleware to measure response length
//    app.use((req, res, next) => {
//     const originalSend = res.send;
//     res.send = function (body) {
//         const responseLength = Buffer.byteLength(body);
//         httpResponseLength.observe({ method: req.method, route: req.path }, responseLength);
//         return originalSend.call(this, body);
//     };
//     next();
// });

// // Middleware to measure request duration
// app.use((req, res, next) => {
//     const end = httpRequestDuration.startTimer();
//     res.on('finish', () => {
//         end({ method: req.method, route: req.path });
//     });
//     next();
// });

app.use(requestCounterMiddleware); // Use the request counter middleware
app.use(responseLengthMiddleware); // Use the response length middleware
app.use(requestDurationMiddleware); // Use the request duration middleware

// ============================
// GET METRICS FOR PROMETHEUS
// ============================
app.get('/baskets/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// ============================
// Baskets API
// ============================
app.use(basketsRouter);

// ============================
// SWAGGER / OPENAPI CONFIG
// ============================
if (process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local") {
    const swaggerDefinition = {
        openapi: '3.1.0',
        info: {
            title: 'Baskets API',
            version: '0.0.1'
        },
        apis: process.env.ENV === "kubernetes-local" ? ['./dist/routers/*Router.js'] : ['./src/routers/*Router.ts']
    };

    const swaggerOptions = {
        swaggerDefinition,
        apis: process.env.ENV === "kubernetes-local" ? ['./dist/routers/*Router.js'] : ['./src/routers/*Router.ts']
    };

    app.use('/baskets/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));
}

app.listen(PORT, () => console.log(`baskets-service running at PORT ${PORT}`));
