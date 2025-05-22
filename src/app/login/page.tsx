"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { fetchWithToken } from "../../services/api_keyclock";

export default function Login() {
  const { authenticated, login } = useAuth();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated) {
      const getUserInfo = async () => {
        try {
          const response = await fetchWithToken("/api/user-info");
          if (!response.ok) {
            const errorData = await response.text(); // Handle non-JSON responses
            throw new Error(`Failed to fetch user info: ${response.status} ${errorData}`);
          }
          const data = await response.json();
          setUserInfo(data);
          router.push("/dashboard");
        } catch (err: any) {
          setError(err.message || "Failed to fetch user info");
          console.error(err);
        }
      };
      getUserInfo();
    }
  }, [authenticated, router]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to Energy Platform</h1>
      {error && <p style={styles.error}>{error}</p>}
      {userInfo ? (
        <p style={styles.message}>Logged in as {userInfo.preferred_username || userInfo.sub}</p>
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
};

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .loginButton:hover {
      background-color: #0096c7;
    }
  `;
  document.head.appendChild(styleSheet);
}