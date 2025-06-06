import { MessagingQueues, PosterDto } from "@realkoder/antik-moderne-shared-types";
import amqp, { Channel, ChannelModel } from "amqplib";
import PosterService from "../service/PosterService.js";

let connection: ChannelModel;
let channel: Channel;

export async function connectToRabbitMQ() {
    try {
        connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
        channel = await connection.createChannel();
        await channel.assertQueue(MessagingQueues.PRODUCT_ADDED, { durable: false });
        await channel.assertQueue(MessagingQueues.ORDER_PENDING, { durable: false });
        console.log("Connected to RabbitMQ and created channel");

        channel.consume(MessagingQueues.ORDER_PENDING, async (msg) => {
            const pendingOrder = JSON.parse(msg.content.toString());
            console.log("pendingOrder received", pendingOrder);
            PosterService.handlePosterOrder(pendingOrder);
            channel.ack(msg);
        });

    } catch (err) {
        // TODO Very simple reconnect strategy here - could do weird stuff be aware!
        setTimeout(connectToRabbitMQ, 5000);
        console.warn(err);
    }
}

export async function publishProductAddedEvent(productAdded: PosterDto) {
    try {
        channel.sendToQueue(MessagingQueues.PRODUCT_ADDED, Buffer.from(JSON.stringify(productAdded)));
        console.log(" [x] Sent '%s'", productAdded);
    } catch (err) {
        console.warn(err);
    }
}