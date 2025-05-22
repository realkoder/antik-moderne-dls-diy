import { MessagingQueues, OrderDto } from "@realkoder/antik-moderne-shared-types";
import amqp, { Channel, ChannelModel } from "amqplib";

let connection: ChannelModel;
let channel: Channel;

export async function connectToRabbitMQ() {
    try {
        connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
        channel = await connection.createChannel();
        
        await channel.assertQueue(MessagingQueues.ORDER_PENDING, { durable: false });
        await channel.assertQueue(MessagingQueues.ORDER_COMPLETED, { durable: false });
        await channel.assertQueue(MessagingQueues.ORDER_CANCELLED, { durable: false });
        
        console.log("Connected to RabbitMQ and created channels");

    } catch (err) {
        // TODO Very simple reconnect strategy here - could do weird stuff be aware!
        setTimeout(connectToRabbitMQ, 5000);
        console.warn(err);
    }
}

export async function publishPendingOrderEvent(newOrder: OrderDto) {
    try {
        channel.sendToQueue(MessagingQueues.ORDER_PENDING, Buffer.from(JSON.stringify(newOrder)));
    } catch (err) {
        console.warn(err);
    }
}