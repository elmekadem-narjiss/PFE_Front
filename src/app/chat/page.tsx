"use client";

import { useState, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<{ content: string; timestamp: string }[]>([]);
  const [input, setInput] = useState('');

  // Charger les anciens messages au démarrage
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/getMessages');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched messages from API:', data);
          setMessages(data);
        } else {
          console.error('Failed to fetch messages:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
  
    fetchMessages();
  }, []);
  // Écouter les nouveaux messages via SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications');

    eventSource.onmessage = (event) => {
      console.log('Raw SSE data:', event.data);
      const data = JSON.parse(event.data);
      const content = data.content && data.content !== 'No content' ? data.content : '[Empty Message]';
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
    <div style={styles.container}>
      <h1 style={styles.header}>Chat App</h1>
      <div style={styles.chatWindow}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              // Simuler un expéditeur : messages pairs à gauche, impairs à droite
              alignSelf: index % 2 === 0 ? 'flex-start' : 'flex-end',
              backgroundColor: index % 2 === 0 ? '#e0e0e0' : '#007bff',
              color: index % 2 === 0 ? '#333' : '#fff',
            }}
          >
            <span style={styles.messageContent}>{msg.content}</span>
            <span style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</span>
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={styles.input}
          placeholder="Tapez votre message..."
        />
        <button onClick={sendMessage} style={styles.sendButton}>
          Envoyer
        </button>
      </div>
    </div>
  );
}

// Styles CSS en ligne (peut être déplacé dans un fichier CSS séparé)
const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '20px',
  },
  chatWindow: {
    flex: 1,
    overflowY: 'scroll' as const,
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '20px',
  },
  message: {
    maxWidth: '60%',
    marginBottom: '10px',
    padding: '8px 12px',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  messageContent: {
    fontSize: '1em',
    wordBreak: 'break-word' as const,
  },
  timestamp: {
    fontSize: '0.7em',
    opacity: 0.7,
    alignSelf: 'flex-end' as const,
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    padding: '10px 0',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '1em',
    borderRadius: '20px',
    border: '1px solid #ddd',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s',
  },
};

// Ajouter un effet hover pour l'input et le bouton via CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    input:hover, input:focus {
      border-color: #007bff;
    }
    button:hover {
      background-color: #0056b3;
    }
  `;
  document.head.appendChild(styleSheet);
}