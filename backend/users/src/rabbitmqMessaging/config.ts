import amqp, { Channel, ChannelModel } from "amqplib";
import UserService from "../service/userService.js";

const userWebhookQueue = "user_clerk_webhook";
const userAddedQueue = "user_added";

let connection: ChannelModel;
let channel: Channel;

export async function connectToRabbitMQ() {

    try {
        connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
        channel = await connection.createChannel();
        await channel.assertQueue(userWebhookQueue, { durable: false });
        await channel.assertQueue(userAddedQueue, { durable: false });
        console.log("Connected to RabbitMQ and created channels");

        channel.consume(userWebhookQueue, async (msg) => {
            const userWebhookEvent = JSON.parse(msg.content.toString());
            await handleUserWebhookEvent(userWebhookEvent);
            channel.ack(msg);
        });

    } catch (err) {
        // TODO Very simple reconnect strategy here - could do weird stuff be aware!
        setTimeout(connectToRabbitMQ, 5000);
        console.warn(err);
    }
}

//PUBLISH EVENT TO EMAIL SERVICE FOR SENDING EMAIL WELCOME
async function publishUserAddedEvent(event: { email: string, name: string }) {
    try {
        channel.sendToQueue(userAddedQueue, Buffer.from(JSON.stringify(event)));
        console.log(" [x] Sent '%s'", event);
    } catch (err) {
        console.warn(err);
    }
}

async function handleUserWebhookEvent(userWebhookEvent) {
    console.log("LOOKK", userWebhookEvent);
    const eventType = userWebhookEvent.type;
    if (eventType === "user.created") {
        try {
            const email = userWebhookEvent.data.email_addresses[0].email_address;
            await UserService.create(userWebhookEvent.data);
            if (email) {
                console.log("THIS IS AWESOME!!! AND THE EMAIL IS", email);
                await publishUserAddedEvent({ name: userWebhookEvent.data.first_name ?? "MissingName", email });
            }
        } catch (e) {
            console.error("Error with creating user by webhook", e);
        }
    } else if (eventType === "user.updated") {
        await UserService.update(userWebhookEvent.data.id, userWebhookEvent.data);
    } else if (eventType === "user.deleted") {
        const userId = userWebhookEvent.data.id;
        if (userId) {
            try {
                await UserService.deleteUser(userId);
            } catch (e) {
                console.error("Error with deleting user by webhook", e);
            }
        }
    }
}