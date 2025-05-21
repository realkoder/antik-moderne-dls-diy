import express from "express";
import promClient from "prom-client";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import basketsRouter from "./routers/basketsRouter.js";
import { logResponseMiddleware, requestCounterMiddleware, requestDurationMiddleware, responseLengthMiddleware } from "@realkoder/antik-moderne-shared-types";

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());

// ============================
// Config metrics to Prometheus
// ============================
app.use(requestCounterMiddleware); // Use the request counter middleware
app.use(responseLengthMiddleware); // Use the response length middleware
app.use(requestDurationMiddleware); // Use the request duration middleware

// ==============================
// Reponse logs for winston-loki
// ==============================
app.use((req, res, next) => {
    logResponseMiddleware("baskets-service", req, res, next);
});

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
