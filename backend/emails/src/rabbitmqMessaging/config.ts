import amqp, { Channel, ChannelModel } from "amqplib";
import EmailService from "../service/EmailService.js";

const userAddedQueue = "user_added";

let connection: ChannelModel;
let channel: Channel;

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
    channel = await connection.createChannel();
    await channel.assertQueue(userAddedQueue, { durable: false });
    console.log("Connected to RabbitMQ and created channel");

    channel.consume(userAddedQueue, async (msg) => {
      const userAddedPayload = JSON.parse(msg.content.toString());
      console.log("USERADDEDLOAD", userAddedPayload);
      EmailService.sendEmail(userAddedPayload);
      channel.ack(msg);
    });

  } catch (err) {
    // TODO Very simple reconnect strategy here - could do weird stuff be aware!
    setTimeout(connectToRabbitMQ, 5000);
    console.warn(err);
  }
}