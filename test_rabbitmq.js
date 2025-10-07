require('dotenv').config();
const amqp = require('amqplib');

(async () => {
  try {
    const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`; 
    console.log("Connecting to:", url);

    const conn = await amqp.connect(url);
    console.log("✅ Connected to RabbitMQ");

    await conn.close();
  } catch (err) {
    console.error("❌ Failed to connect RabbitMQ:", err.message);
  }
})();
