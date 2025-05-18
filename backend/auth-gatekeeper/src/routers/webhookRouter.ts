import Router from 'express';
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import bodyParser from 'body-parser';
import { publishWebhookUserEvent } from '../rabbitmqMessaging/config.js';

const router = Router();

const WEBHOOK_SECRET_SIGNING_KEY = process.env.WEBHOOK_SECRET_SIGNING_KEY;

router.post('/api/v1/users/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
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

export default router;