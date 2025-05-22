'use client';
import { useState, useEffect } from "react";

export const useMessages = (authenticated: boolean) => {
  const [messages, setMessages] = useState<{ content: string; timestamp: string; isRead: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/getMessages", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data.map((msg: { content: string; timestamp: string }) => ({ ...msg, isRead: false })));
      } catch (error) {
        setError("Error loading messages");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    const eventSource = new EventSource("/api/notifications");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const content = data.content || "[Empty Message]";
      const timestamp = data.timestamp || new Date().toISOString();
      setMessages((prev) => [...prev, { content, timestamp, isRead: false }].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    eventSource.onerror = () => eventSource.close();

    return () => eventSource.close();
  }, [authenticated]);

  return { messages, setMessages, loading, error };
};