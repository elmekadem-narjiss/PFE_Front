"use client";

import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Login() {
  const { authenticated, login, logout, userInfo, error } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to Energy Platform</h1>
      {error && <p style={styles.error}>{error}</p>}
      {userInfo ? (
        <>
          <p style={styles.message}>Logged in as {userInfo.preferred_username || userInfo.sub}</p>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
          <button onClick={() => router.push("/dashboard")} style={styles.dashboardButton}>
            Go to Dashboard
          </button>
        </>
      ) : (
        <>
          <p style={styles.message}>Please log in to access the platform</p>
          <button onClick={login} style={styles.loginButton}>
            Login with Keycloak
          </button>
        </>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #0d1b2a, #1b263b)",
    color: "#e0e0e0",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    fontSize: "2.5em",
    marginBottom: "20px",
    color: "#00b4d8",
  },
  message: {
    fontSize: "1.2em",
    marginBottom: "20px",
  },
  error: {
    fontSize: "1em",
    color: "#ff4444",
    marginBottom: "20px",
  },
  loginButton: {
    padding: "12px 25px",
    backgroundColor: "#00b4d8",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background-color 0.3s",
  },
  logoutButton: {
    padding: "12px 25px",
    backgroundColor: "#ff4444",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background-color 0.3s",
    marginBottom: "10px",
  },
  dashboardButton: {
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

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .loginButton:hover {
      background-color: #0096c7;
    }
    .logoutButton:hover {
      background-color: #cc3333;
    }
    .dashboardButton:hover {
      background-color: #0096c7;
    }
  `;
  document.head.appendChild(styleSheet);
}