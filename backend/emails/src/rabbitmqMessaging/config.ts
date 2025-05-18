import amqp, { Channel, ChannelModel } from "amqplib";
import EmailService from "../service/EmailService.js";
import { MessagingQueues } from "@realkoder/antik-moderne-shared-types";

let connection: ChannelModel;
let channel: Channel;

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
    channel = await connection.createChannel();
    await channel.assertQueue(MessagingQueues.USER_ADDED, { durable: false });
    await channel.assertQueue(MessagingQueues.PRODUCT_ADDED, { durable: false });
    console.log("Connected to RabbitMQ and created channel");

    channel.consume(MessagingQueues.USER_ADDED, async (msg) => {
      const userAddedPayload = JSON.parse(msg.content.toString());
      console.log("USERADDEDLOAD", userAddedPayload);
      EmailService.sendEmail(userAddedPayload);
      channel.ack(msg);
    });
    
    channel.consume(MessagingQueues.PRODUCT_ADDED, async (msg) => {
      const productAddedPayload = JSON.parse(msg.content.toString());
      console.log("PRODUCT_ADDED RECEIVED", productAddedPayload);
      EmailService.sendProductAddedEmail(productAddedPayload);
      channel.ack(msg);
    });

  } catch (err) {
    // TODO Very simple reconnect strategy here - could do weird stuff be aware!
    setTimeout(connectToRabbitMQ, 5000);
    console.warn(err);
  }
}