"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import Keycloak from "keycloak-js";
import { useRouter } from "next/navigation";

// Create Keycloak instance
const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "myrealm",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "my-nodejs-client",
});

interface KeycloakContextType {
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  userInfo: any;
  error: string | null;
}

export const KeycloakContext = createContext<KeycloakContextType>({
  authenticated: false,
  login: () => {},
  logout: () => {},
  userInfo: null,
  error: null,
});

export function KeycloakProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize Keycloak only once
    keycloak
      .init({ onLoad: "check-sso", checkLoginIframe: false })
      .then((auth) => {
        setAuthenticated(auth);
        if (auth && keycloak.token) {
          localStorage.setItem("token", keycloak.token);
          fetchUserInfo();
        }
      })
      .catch((err) => {
        console.error("Keycloak initialization error:", err);
        setError("Failed to initialize Keycloak");
      });

    // Fetch user info when authenticated
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user-info", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        const data = await response.json();
        setUserInfo(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user info");
        console.error(err);
      }
    };
  }, []);

  const login = () => keycloak.login({ redirectUri: window.location.origin + "/login" });
  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin + "/login" });
    localStorage.removeItem("token");
    setAuthenticated(false);
    setUserInfo(null);
    setError(null);
  };

  return (
    <KeycloakContext.Provider value={{ authenticated, login, logout, userInfo, error }}>
      {children}
    </KeycloakContext.Provider>
  );
}