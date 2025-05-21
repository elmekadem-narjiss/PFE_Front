"use client";

import { useState, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<{ content: string; timestamp: string }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const content = data.content || 'No content';
      const timestamp = data.timestamp || new Date().toISOString();
      console.log('Message received via SSE:', content, 'at', timestamp);
      setMessages((prev) => [...prev, { content, timestamp }]);
    };

    eventSource.onerror = () => {
      console.error('SSE error');
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const response = await fetch('/api/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    console.log('Response status:', response.status, response.statusText);
    if (response.ok) {
      setInput('');
    } else {
      console.error('Failed to send message:', await response.text());
    }
  };

  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' });
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Chat App</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll', background: '#333' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ color: 'white', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.8em', color: '#bbb' }}>{formatTimestamp(msg.timestamp)}</span> - {msg.content}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{ padding: '5px', width: '300px' }}
        />
        <button onClick={sendMessage} style={{ padding: '5px 10px', marginLeft: '5px' }}>
          Send
        </button>
      </div>
    </div>
  );
}