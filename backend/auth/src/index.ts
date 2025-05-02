import express from "express";
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import bodyParser from 'body-parser';
import { connectToRabbitMQ, publishWebhookUserEvent } from './rabbitmqMessaging/config.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

const corsOptions = {
    // origin: ['http://localhost', 'https://antik-moderne.realkoder.com'],
    origin: ['http://localhost:3000', 'http://frontend-app:5173', 'https://antik-moderne.realkoder.com'],
};

app.use(cors(corsOptions));
app.use(clerkMiddleware())

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

const SERVICES = {
    AUTH: 'http://localhost:3001',
    BASKETS: 'http://baskets-service:3002',
    PRODUCTS: 'http://products-service:3004',
    USERS: 'http://users-service:3005'
};

app.use(async (req, res, next) => {
    try {
        // Validate token through Auth Service
        if (req.path.split("/")[2] === "auth") {
            try {
                const { userId } = getAuth(req);
                if (!userId) {
                    res.status(401).send('UserId not found - Unauthorized');
                    return;
                }
                const userRoleRes = await fetch(SERVICES.USERS + "/internal/users/api/v1/role", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json', // Set content type
                    },
                    body: JSON.stringify({ userId })
                });
                if (userRoleRes.ok) {
                    const userRole = await userRoleRes.json();
                    req.body.userId = userId;
                    req.body.role = userRole;
                    console.log("OKAY SICK!!", userId, userRole);

                } else {
                    res.status(401).send('UserRole not found - Unauthorized');
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }

        // Determine target service
        let target = '';
        if (req.path.startsWith('/baskets')) target = SERVICES.BASKETS;
        if (req.path.startsWith('/products')) target = SERVICES.PRODUCTS;
        if (req.path.startsWith('/users')) target = SERVICES.USERS;
        console.log("TAG", target)

        if (!target) {
            res.status(404).send('Not Found');
            return;
        }

        // Forward to target service
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: { [`^/${target.split('/').pop()}`]: '' }
        })(req, res, next);

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/", (req, res) => {
    res.status(200).send({ data: "OK" });
})

connectToRabbitMQ();
app.listen(PORT, () => console.log(`Express server instantiated PORT ${PORT}`));
