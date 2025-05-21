import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'chat-app',
  brokers: ['localhost:9092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'chat-group' });

let isProducerConnected = false;
let isConsumerConnected = false;

export const connectKafka = async () => {
  try {
    if (!isProducerConnected) {
      await producer.connect();
      isProducerConnected = true;
      console.log('Producer connected');
    }
    if (!isConsumerConnected) {
      await consumer.connect();
      isConsumerConnected = true;
      console.log('Consumer connected');
    }
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
    throw error;
  }
};

export const ensureProducerConnected = async () => {
  if (!isProducerConnected) {
    await connectKafka();
  }
};