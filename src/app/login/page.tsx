"use client";

import { useKeycloak } from "@/context/KeycloakContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css"; // Import the CSS module

export default function LoginPage() {
  const { keycloak, initialized, initError, updateAuthState } = useKeycloak();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    if (initError) {
      console.error("Keycloak initialization error:", initError);
      return;
    }

    if (keycloak.authenticated && hasLoggedIn) {
      console.log("User is authenticated and has logged in, redirecting to /dashboard (via useEffect)");
      router.push("/dashboard");
    }
  }, [initialized, initError, keycloak.authenticated, router, hasLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const baseUrl = (keycloak.authServerUrl || "http://localhost:8080").endsWith("/")
        ? keycloak.authServerUrl || "http://localhost:8080"
        : `${keycloak.authServerUrl || "http://localhost:8080"}/`;
      const tokenEndpoint = `${baseUrl}realms/${keycloak.realm}/protocol/openid-connect/token`;

      console.log("Fetching token from:", tokenEndpoint);

      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username,
          password,
          grant_type: "password",
          client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "my-nodejs-client",
          client_secret: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || "1kDtv3s3SO6O2xXwAjjR8KJE9CKyBg5r",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error_description || "Authentication failed");
      }

      const data = await response.json();
      const token = data.access_token;
      const refreshToken = data.refresh_token;

      if (token) {
        updateAuthState(true, token, refreshToken);
        setHasLoggedIn(true);
        console.log("Login successful, attempting to redirect to /dashboard");
        try {
          await router.push("/dashboard");
          console.log("Router push to /dashboard completed");
        } catch (err) {
          console.error("Router push failed:", err);
          // Fallback redirect
          console.log("Falling back to window.location.href for redirect");
          window.location.href = "/dashboard";
        }
      } else {
        setError("Authentication failed: No token received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(`Login failed. Details: ${errorMessage}`);
      console.error("Login error:", err);
    }
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (initError) {
    return <div>Error: {initError.message}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sign in to your account</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Username or email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            placeholder="testuser"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button type="submit" className={styles.button}>
          Sign In
        </button>
      </form>
    </div>
  );
}