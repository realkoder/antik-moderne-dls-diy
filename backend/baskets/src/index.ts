import express from "express";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import basketsRouter from "./routers/basketsRouter.js";

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());

// =========================
// Baskets API
// =========================
app.use(basketsRouter);

// =========================
// SWAGGER / OPENAPI CONFIG
// =========================
if (process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local") {
    const swaggerDefinition = {
        openapi: '3.1.0',
        info: {
            title: 'Baskets API',
            version: '0.0.1'
        },
        apis: ['./src/routers/*Router.ts']
    };

    const swaggerOptions = {
        swaggerDefinition,
        apis: ['./src/routers/*Router.ts']
    };

    app.use('/baskets/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));
}

app.listen(PORT, () => console.log(`baskets-service running at PORT ${PORT}`));
