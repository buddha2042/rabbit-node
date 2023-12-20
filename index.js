const express = require('express'); 
const amqp = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();
const app = express(); 
const port = 3000




function getRabbitMQConfig() {
  return {
    url: process.env.RABBITMQ_URL,
    port: parseInt(process.env.RABBITMQ_PORT, 10),
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PWD,
    vhost: process.env.RABBITMQ_VHOST,
    queuePreName: process.env.RABBITMQ_QUEUE_PRE_NAME
  };
}

async function sendMessageToQueue(message) {
  try {
    const rabbitmqConfig = getRabbitMQConfig();
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: rabbitmqConfig.url,
      port: rabbitmqConfig.port,
      username: rabbitmqConfig.user,
      password: rabbitmqConfig.password,
      vhost: rabbitmqConfig.vhost
    });

    const channel = await connection.createChannel();
    const queueName = `${rabbitmqConfig.queuePreName}`;

    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(message));

    console.log(`Message sent to RabbitMQ queue (${queueName}): ${message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error.message);
  }
}

async function consumeMessagesFromQueue() {
  try {
    const rabbitmqConfig = getRabbitMQConfig();
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: rabbitmqConfig.url,
      port: rabbitmqConfig.port,
      username: rabbitmqConfig.user,
      password: rabbitmqConfig.password,
      vhost: rabbitmqConfig.vhost
    });

    const channel = await connection.createChannel();
    const queueName = `${rabbitmqConfig.queuePreName}`;

    await channel.assertQueue(queueName, { durable: false });

    console.log(`Waiting for messages. To exit press CTRL+C`);

    channel.consume(queueName, (message) => {
      if (message) {
        console.log(`Received message from RabbitMQ: ${message.content.toString()}`);
        channel.ack(message);
      }
    });

  } catch (error) {
    console.error('Error consuming messages from RabbitMQ:', error.message);
  }
}
// Example usage:
sendMessageToQueue('Hello, RabbitMQ!');
consumeMessagesFromQueue()



app.listen(port , ()=>{
    console.log(`App is running ${port}`)
})