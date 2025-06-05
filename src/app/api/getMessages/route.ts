import { Kafka } from "kafkajs";
import { NextResponse } from "next/server";

const kafka = new Kafka({
  clientId: "message-fetcher",
  brokers: ["localhost:9092"],
});

export async function GET() {
  const consumer = kafka.consumer({ groupId: "message-fetcher-group" });
  const admin = kafka.admin();

  try {
    await admin.connect();

    // Validate topic existence
    const topicMetadata = await admin.fetchTopicMetadata({ topics: ["team-messages"] });
    if (!topicMetadata.topics.some((t) => t.name === "team-messages")) {
      throw new Error("Topic 'team-messages' does not exist");
    }

    // Check consumer group state and pause if necessary (avoid deletion)
    const groupDescription = await admin.describeGroups(["message-fetcher-group"]);
    const group = groupDescription.groups.find((g) => g.groupId === "message-fetcher-group");

    if (group && group.state === "Stable") {
      console.log("Consumer group is active, waiting to stabilize...");
      // Wait to avoid race condition with other consumers
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Optionally reset offsets only if critical (avoid if possible)
      await admin.resetOffsets({
        groupId: "message-fetcher-group",
        topic: "team-messages",
        earliest: true,
      });
    }

    await consumer.connect();
    await consumer.subscribe({ topic: "team-messages", fromBeginning: true });

    const messages: { content: string; timestamp: string }[] = [];
    let isDone = false;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        isDone = true;
        resolve();
      }, 5000);

      consumer
        .run({
          eachMessage: async ({ message }) => {
            if (isDone) return;

            const rawMessage = message.value?.toString() || "";
            let content, timestamp;

            try {
              const msgData = JSON.parse(rawMessage);
              content = msgData.content || rawMessage;
              timestamp = msgData.timestamp || new Date().toISOString();
            } catch (error) {
              content = rawMessage;
              timestamp = new Date().toISOString();
            }

            messages.push({ content, timestamp });

            if (messages.length >= 100) {
              isDone = true;
              resolve();
            }
          },
          autoCommit: false,
        })
        .catch(reject);

      return () => clearTimeout(timeout);
    });

    await consumer.disconnect();
    await admin.disconnect();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages from Kafka:", error);
    console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    await consumer.disconnect().catch((err) => console.warn("Error disconnecting consumer:", err));
    await admin.disconnect().catch((err) => console.warn("Error disconnecting admin:", err));
    return NextResponse.json({ error: `Failed to fetch messages: ${errorMessage}` }, { status: 500 });
  }
}