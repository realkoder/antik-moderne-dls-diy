import { WebhookEvent } from "@clerk/express";
import amqp, { Channel, ChannelModel } from "amqplib";

const userWebhookQueue = "user_clerk_webhook";

let connection: ChannelModel;
let channel: Channel;

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
    channel = await connection.createChannel();
    await channel.assertQueue(userWebhookQueue, { durable: false });
    console.log("Connected to RabbitMQ and created channel");

  } catch (err) {
    // TODO Very simple reconnect strategy here - could do weird stuff be aware!
    setTimeout(connectToRabbitMQ, 5000);
    console.warn(err);
  }
}

export async function publishWebhookUserEvent(event: WebhookEvent) {
  try {
    channel.sendToQueue(userWebhookQueue, Buffer.from(JSON.stringify(event)));
    console.log(" [x] Sent '%s'", event);
  } catch (err) {
    console.warn(err);
  }
}