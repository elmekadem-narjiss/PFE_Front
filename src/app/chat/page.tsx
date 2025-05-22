'use client';

import { useState, useEffect } from "react";
import { CSSProperties } from "react"; // Import CSSProperties

export default function Chat() {
  const [messages, setMessages] = useState<
    { content: string; timestamp: string; isRead: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/getMessages");
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(
          data.map((msg: { content: string; timestamp: string }) => ({
            ...msg,
            isRead: false,
          }))
        );
      } catch (error) {
        setError("Error loading messages. Please try again later.");
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const content = data.content && data.content !== "No content" ? data.content : "[Empty Message]";
      const timestamp = data.timestamp || new Date().toISOString();
      setMessages((prev) => [...prev, { content, timestamp, isRead: false }].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setNewMessageAlert(true);
      setTimeout(() => setNewMessageAlert(false), 3000);
    };

    eventSource.onerror = () => {
      console.error("SSE error");
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch("/api/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      setInput("");
    } catch (error) {
      setError("Error sending message. Please try again.");
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris" });
  };

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerStyle: CSSProperties = {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 191, 255, 0.3)",
    fontFamily: "Arial, sans-serif",
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    background: isDarkTheme ? "linear-gradient(135deg, #0d1b2a, #1b263b)" : "#f0f4f8",
    color: isDarkTheme ? "#e0e0e0" : "#1a1a2e",
    border: `1px solid ${isDarkTheme ? "#00b4d8" : "#a3bffa"}`,
  };

  const chatWindowStyle: CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    borderRadius: "8px",
    border: `1px solid ${isDarkTheme ? "#00b4d8" : "#a3bffa"}`,
    marginBottom: "15px",
    background: isDarkTheme ? "#1a2a44" : "#ffffff",
    scrollbarWidth: "thin",
    scrollbarColor: `${isDarkTheme ? "#00b4d8" : "#a3bffa"} #333`,
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ ...styles.header, color: isDarkTheme ? "#00b4d8" : "#1a1a2e" }}>Energy Chat App</h1>
      <button onClick={toggleTheme} style={styles.themeButton}>
        {isDarkTheme ? "Light Theme" : "Dark Theme"}
      </button>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
        placeholder="Search messages..."
      />
      {newMessageAlert && (
        <div style={{ ...styles.alert, backgroundColor: isDarkTheme ? "#28a745" : "#2ecc71" }}>
          New energy update received!
        </div>
      )}
      {loading && <div style={styles.loading}>Loading energy data...</div>}
      {error && <div style={styles.error}>{error}</div>}
      <div style={chatWindowStyle}>
        {filteredMessages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: index % 2 === 0 ? "flex-start" : "flex-end",
              background: msg.isRead
                ? (index % 2 === 0 ? (isDarkTheme ? "#2a4066" : "#d3e0ea") : "#00b4d8")
                : (index % 2 === 0 ? (isDarkTheme ? "#3a5076" : "#e6eef3") : "#0096c7"),
              color: isDarkTheme || index % 2 !== 0 ? "#fff" : "#1a1a2e",
            }}
            onClick={() => {
              const updatedMessages = [...messages];
              updatedMessages[index].isRead = true;
              setMessages(updatedMessages);
            }}
          >
            <span style={styles.messageContent}>{msg.content}</span>
            <span style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteMessage(index);
              }}
              style={styles.deleteButton}
            >
              X
            </button>
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          style={styles.input}
          placeholder="Type energy message..."
        />
        <button onClick={sendMessage} style={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
}

// Define styles with CSSProperties type
const styles: { [key: string]: CSSProperties } = {
  header: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "2em",
  },
  themeButton: {
    padding: "8px 15px",
    marginBottom: "15px",
    backgroundColor: "#00b4d8",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  searchInput: {
    padding: "10px",
    marginBottom: "15px",
    width: "100%",
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "#00b4d8",
    outline: "none",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
  },
  alert: {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px",
    borderRadius: "20px",
    zIndex: 1000,
    animation: "blink 3s",
  },
  loading: {
    textAlign: "center",
    padding: "10px",
    color: "#00b4d8",
  },
  error: {
    textAlign: "center",
    padding: "10px",
    color: "#ff4444",
    background: "rgba(255, 68, 68, 0.1)",
    borderRadius: "5px",
  },
  chatWindow: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "15px",
    background: "#fff",
  },
  message: {
    maxWidth: "70%",
    marginBottom: "12px",
    padding: "10px 15px",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    position: "relative",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  messageContent: {
    fontSize: "1em",
    wordBreak: "break-word",
  },
  timestamp: {
    fontSize: "0.7em",
    opacity: 0.8,
    alignSelf: "flex-end",
  },
  deleteButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    padding: "2px 6px",
    backgroundColor: "#ff4444",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "0.7em",
    transition: "background-color 0.3s",
  },
  inputContainer: {
    display: "flex",
    gap: "15px",
    padding: "10px 0",
  },
  input: {
    flex: 1,
    padding: "12px",
    fontSize: "1em",
    borderRadius: "20px",
    border: "1px solid #00b4d8",
    outline: "none",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  sendButton: {
    padding: "12px 25px",
    backgroundColor: "#00b4d8",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background-color 0.3s",
  },
};

// Add CSS animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes blink {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    input:hover, input:focus {
      border-color: #0096c7;
      box-shadow: 0 0 5px #00b4d8;
    }
    button:hover {
      background-color: #0096c7;
    }
    .deleteButton:hover {
      background-color: #cc0000;
    }
    .chatWindow::-webkit-scrollbar {
      width: 8px;
    }
    .chatWindow::-webkit-scrollbar-thumb {
      background-color: #00b4d8;
      border-radius: 4px;
    }
    .chatWindow::-webkit-scrollbar-track {
      background: #1a2a44;
    }
  `;
  document.head.appendChild(styleSheet);
}