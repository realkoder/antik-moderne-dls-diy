import { MessagingQueues, PosterDto } from "@realkoder/antik-moderne-shared-types";
import amqp, { Channel, ChannelModel } from "amqplib";

let connection: ChannelModel;
let channel: Channel;

export async function connectToRabbitMQ() {
    try {
        connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
        channel = await connection.createChannel();
        await channel.assertQueue(MessagingQueues.PRODUCT_ADDED, { durable: false });
        console.log("Connected to RabbitMQ and created channel");

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