import express from "express";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import productsRouter from './routers/productsRouter.js';

const app = express();
const PORT = process.env.PORT ?? 3004;

app.use(express.json());

// =========================
// Products API
// =========================
app.use(productsRouter);

// =========================
// SWAGGER / OPENAPI CONFIG
// =========================
if (process.env.ENV === "docker-compose" || process.env.ENV === "kubernetes-local") {
    const swaggerDefinition = {
        openapi: '3.1.0',
        info: {
            title: 'Products API',
            version: '0.0.1'
        },
        apis: process.env.ENV === "kubernetes-local" ? ['./dist/routers/*Router.js'] : ['./src/routers/*Router.ts']
    };

    const swaggerOptions = {
        swaggerDefinition,
        apis: process.env.ENV === "kubernetes-local" ? ['./dist/routers/*Router.js'] : ['./src/routers/*Router.ts']
    };

    app.use('/products/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));
}

app.listen(PORT, () => console.log(`products-service running at PORT ${PORT}`));
