import { Kafka } from "kafkajs";
import { NextResponse } from "next/server";

// Initialize Kafka client (shared across requests)
const kafka = new Kafka({
  clientId: "message-fetcher",
  brokers: ["localhost:9092"],
});

export async function GET() {
  const consumer = kafka.consumer({ groupId: "message-fetcher-group" });
  const admin = kafka.admin();

  try {
    // Connect consumer and admin
    await consumer.connect();
    await admin.connect();

    // Reset offsets to earliest
    await admin.resetOffsets({
      groupId: "message-fetcher-group",
      topic: "team-messages",
      earliest: true,
    });

    // Subscribe to the topic before running the consumer
    await consumer.subscribe({ topic: "team-messages", fromBeginning: true });

    // Fetch topic offsets to determine the end
    const topicOffsets = await admin.fetchTopicOffsets("team-messages");
    const maxOffset = parseInt(topicOffsets[0].high, 10);

    const messages: { content: string; timestamp: string }[] = [];

    // Run the consumer to fetch messages
    await new Promise<void>((resolve, reject) => {
      consumer.run({
        eachMessage: async ({ message }) => {
          const rawMessage = message.value?.toString() || "";
          let content, timestamp;

          try {
            const msgData = JSON.parse(rawMessage);
            if (msgData.content && msgData.timestamp) {
              content = msgData.content;
              timestamp = msgData.timestamp;
            } else {
              content = rawMessage;
              timestamp = new Date().toISOString();
            }
          } catch (error) {
            content = rawMessage;
            timestamp = new Date().toISOString();
          }

          messages.push({ content, timestamp });

          // Check if we've reached the end of the topic
          const currentOffset = parseInt(message.offset, 10);
          if (currentOffset >= maxOffset - 1) {
            resolve(); // Resolve the promise when done
          }
        },
        autoCommit: false, // Disable auto-commit to control offset manually
      }).catch(reject); // Handle errors from consumer.run
    });

    // Disconnect consumer and admin
    await consumer.disconnect();
    await admin.disconnect();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages from Kafka:", error);
    // Ensure cleanup on error
    await consumer.disconnect().catch(() => {});
    await admin.disconnect().catch(() => {});
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}