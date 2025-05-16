import express from "express";
import promClient from 'prom-client';
import { connectToRabbitMQ } from "./rabbitmqMessaging/config.js";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import usersRouters from './routers/usersRouter.js';

const app = express();
const PORT = process.env.PORT ?? 3005;

app.use(express.json());

// =========================
// USERS API
// =========================
app.use(usersRouters)

// ============================
// Config metrics to Prometheus
// ============================
promClient.collectDefaultMetrics();

const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route'],
});

app.use((req, _, next) => {
    httpRequestCounter.inc({ method: req.method, route: req.path });
    next();
});

// ============================
// METRICS FOR PROMETHEUS
// ============================
app.get('/users/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// =========================
// SWAGGER / OPENAPI CONFIG
// =========================
if (process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local") {
    const swaggerDefinition = {
        openapi: '3.1.0',
        info: {
            title: 'Users API',
            version: '0.0.1'
        },
        apis: process.env.ENV === "kubernetes-local" ? ['./dist/routers/*Router.js'] : ['./src/routers/*Router.ts']
    };

    const swaggerOptions = {
        swaggerDefinition,
        // apis: ['./src/routers/*Router.ts', './dist/routers/*Router.js']
        apis: process.env.ENV === "kubernetes-local" ? ['./dist/routers/*Router.js'] : ['./src/routers/*Router.ts']
    };

    app.use('/users/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));
}

// Middleware to handle unmatched routes
// app.use((req, res) => {
//     res.redirect(302, 'https://www.disney.com');
// });

connectToRabbitMQ();
app.listen(PORT, () => console.log(`user-service running at PORT ${PORT}`));
