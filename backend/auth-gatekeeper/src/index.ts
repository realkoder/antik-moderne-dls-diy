import express from "express";
import cors from 'cors';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import bodyParser from 'body-parser';
import promClient from 'prom-client';
import { connectToRabbitMQ, publishWebhookUserEvent } from './rabbitmqMessaging/config.js';
import { requestCounterMiddleware, requestDurationMiddleware, responseLengthMiddleware } from "@realkoder/antik-moderne-shared-types";

const app = express();
const PORT = process.env.PORT ?? 3001;

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:30000', 'http://frontend-app:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));

// ==================
// WEBHOOK CLERK
// ==================

const WEBHOOK_SECRET_SIGNING_KEY = process.env.WEBHOOK_SECRET_SIGNING_KEY;

app.post('/api/v1/users/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    if (!WEBHOOK_SECRET_SIGNING_KEY) {
        res.status(500).json({ error: 'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local' });
        return;
    }

    const payload = req.body;
    const { 'svix-id': webhookId, 'svix-timestamp': webhookTimestamp, 'svix-signature': webhookSignature } = req.headers;

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
        res.status(400).json({ error: 'Error: Missing required headers' });
        return;
    }

    const wh = new Webhook(WEBHOOK_SECRET_SIGNING_KEY);
    let event: WebhookEvent;
    try {
        event = wh.verify(payload, {
            'webhook-id': webhookId as string,
            'webhook-timestamp': webhookTimestamp as string,
            'webhook-signature': webhookSignature as string,
        }) as WebhookEvent;
        console.log(Date.now, "THIS IS IT", event);

        await publishWebhookUserEvent(event);
    } catch (err) {
        console.log("ERRRIR", err);
        res.status(400).json({});
        return;
    }

    res.status(200).json({ message: 'Webhook received' });
});

app.use(express.json());
app.use(clerkMiddleware());

// ============================
// Config metrics to Prometheus
// ============================
app.use(requestCounterMiddleware); // Use the request counter middleware
app.use(responseLengthMiddleware); // Use the response length middleware
app.use(requestDurationMiddleware); // Use the request duration middleware

// ============================
// METRICS FOR PROMETHEUS
// ============================
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// Ensure app is accessible and running
app.get('/health', (req, res) => {
    res.send({ data: 'OK' });
    return;
});

const SERVICES = {
    BASKETS: 'http://baskets-service:3002',
    PRODUCTS: 'http://products-service:3004',
    USERS: 'http://users-service:3005'
};

app.use(async (req, res, next) => {
    try {
        console.log("Request Method:", req.method);
        console.log("Request Path:", req.path);
        // console.log("Request Body:", req.body);

        // Determine target service base-url
        let target = '';
        if (req.path.startsWith('/baskets')) target = SERVICES.BASKETS;
        if (req.path.startsWith('/products')) target = SERVICES.PRODUCTS;
        if (req.path.startsWith('/users')) target = SERVICES.USERS;

        // If Prom metrics gets requested parse the request furhter on
        console.log("REQ PATH", req.path);
        if (req.path === "/metrics") {
            next();
            return; // Important with this return since this middleware has to be quited
        }

        if (!target) {
            res.status(404).send('Not Found');
            return;
        }

        // Authorization logic
        let userId: string, userRole: string;
        if (req.path.split("/")[2] === "auth") {
            const authResult = await authorize(req); // Await the authorization
            userId = authResult.userId;
            userRole = authResult.userRole;
        }

        // Forward to target service
        createProxyMiddleware({
            target: target,
            on: {
                // If userId || userRole present they will be added for forwarded request
                proxyReq: async (proxyReq, incomingReq, res) => {
                    if (userId) {
                        proxyReq.setHeader('x-user-id', userId);
                    }
                    if (userRole) {
                        proxyReq.setHeader('x-user-role', userRole);
                    }
                    // Fixes issue with parsing the request body
                    fixRequestBody(proxyReq, req);
                },
            },
        })(req, res, next);

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function authorize(req) {
    try {
        const { userId } = getAuth(req);

        if (userId) {
            const userRoleRes = await fetch(SERVICES.USERS + "/internal/users/api/v1/role", {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId })
            });

            if (userRoleRes.ok) {
                const userRole = await userRoleRes.json();
                return { userId, userRole: userRole.role };
            }
        }
    } catch (e) {
        console.log("Error with AUTH CHECK", e);
    }
    return { userId: undefined, userRole: 'USER' };
}


// THis is just for testing that server is up and accessible
app.get("/", (req, res) => {
    res.status(200).send({ data: "OK" });
})

connectToRabbitMQ();
app.listen(PORT, () => console.log(`Express server instantiated PORT ${PORT}`));