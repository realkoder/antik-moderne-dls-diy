import express from "express";
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import promClient from 'prom-client';
import { connectToRabbitMQ } from './rabbitmqMessaging/config.js';
import { requestCounterMiddleware, requestDurationMiddleware, responseLengthMiddleware } from "@realkoder/antik-moderne-shared-types/dist/prometheusMetricsMiddleware/metricsMiddleware.js";
// import { logResponseMiddleware } from "@realkoder/antik-moderne-shared-types/dist/winston-loki-logger/winstonLokiLoggerConfig.js";
import webHookRouter from './routers/webhookRouter.js';
import proxyHttpRequestsRouter from './routers/proxyHttpRequestsRouter.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:30000', 'http://frontend-app:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// ==========================================
// WEBHOOK CLERK
// ==========================================
app.use(webHookRouter);

// ==============================
// Reponse logs for winston-loki
// ==============================
// app.use((req, res, next) => {
//     logResponseMiddleware("auth-gatekeeper-service", req, res, next);
// });


// ==========================================
// Enabling req.body serialization and clerk
// ==========================================
app.use(express.json());
app.use(clerkMiddleware());

// ==========================================
// Config metrics to Prometheus
// ==========================================
app.use(requestCounterMiddleware);
app.use(responseLengthMiddleware);
app.use(requestDurationMiddleware);


// ==========================================
// METRICS FOR PROMETHEUS
// ==========================================
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// ==========================================
// Healt-check - ensuring app is available
// ==========================================
app.get('/health', (req, res) => {
    res.json({ data: 'OK' });
    return;
});

// ==========================================
// Enabling the http-proxy-middleware logic
// ==========================================
app.use(proxyHttpRequestsRouter);


connectToRabbitMQ();
app.listen(PORT, () => console.log(`Express server instantiated PORT ${PORT}`));