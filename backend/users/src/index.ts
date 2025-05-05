import express from "express";
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

// =========================
// SWAGGER / OPENAPI CONFIG
// =========================
if (process.env.ENV === "docker-compose") {
    const swaggerDefinition = {
        openapi: '3.1.0',
        info: {
            title: 'Users API',
            version: '0.0.1'
        },
        apis: ['./src/routers/*Router.ts']
    };

    const swaggerOptions = {
        swaggerDefinition,
        apis: ['./src/routers/*Router.ts']
    };

    app.use('/users/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));
}

// Middleware to handle unmatched routes
// app.use((req, res) => {
//     res.redirect(302, 'https://www.disney.com');
// });

connectToRabbitMQ();
app.listen(PORT, () => console.log(`user-service running at PORT ${PORT}`));
