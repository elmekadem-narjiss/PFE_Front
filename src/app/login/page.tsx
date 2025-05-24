"use client";

import { useKeycloak } from "@/context/KeycloakContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { keycloak, initialized, initError, updateAuthState } = useKeycloak();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasLoggedIn, setHasLoggedIn] = useState(false); // Track if the user has actively logged in

  useEffect(() => {
    if (!initialized) return;

    if (initError) {
      console.error("Keycloak initialization error:", initError);
      return;
    }

    if (keycloak.authenticated && hasLoggedIn) {
      console.log("User is authenticated and has logged in, redirecting to /dashboard");
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
        updateAuthState(true, token, refreshToken); // Sync the state
        setHasLoggedIn(true); // Set flag after successful login
        router.push("/dashboard");
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
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", background: "#fff", borderRadius: "5px" }}>
      <h2>Sign in to your account</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label>Username or email</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            placeholder="testuser"
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
        </div>
        <button
          type="submit"
          style={{ width: "100%", padding: "10px", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}