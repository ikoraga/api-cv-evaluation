const amqp = require("amqplib");
require("dotenv").config();

let channel = null;

async function connectQueue() {
  try {
    const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`;
    const connection = await amqp.connect(url);

    channel = await connection.createChannel();

    await channel.assertQueue("evaluation", { durable: true });

    console.log("Connected to RabbitMQ queue 'evaluation'");

    connection.on("close", () => {
      console.error("RabbitMQ connection closed!");
      channel = null;
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
      channel = null;
    });
  } catch (err) {
    console.error("Failed to connect RabbitMQ:", err);
    setTimeout(connectQueue, 5000);
  }
}

connectQueue();

module.exports = { getChannel: () => channel };
