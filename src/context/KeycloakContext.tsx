"use client";

import Keycloak from "keycloak-js";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

const baseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
const authServerUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

const initialKeycloak = new Keycloak({
  url: authServerUrl,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "myrealm",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "my-nodejs-client",
});

interface KeycloakContextType {
  keycloak: Keycloak;
  initialized: boolean;
  initError: Error | null;
  updateAuthState: (authenticated: boolean, token?: string, refreshToken?: string) => void;
}

export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
};

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [keycloak] = useState<Keycloak>(initialKeycloak);
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const authStateRef = useRef({ authenticated: false, token: "", refreshToken: "" });

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        const storedAuth = localStorage.getItem("authState");
        let authenticated = false;

        // Always initialize Keycloak to validate the session
        authenticated = await keycloak.init({ onLoad: "check-sso", checkLoginIframe: false });

        if (storedAuth) {
          const { token, refreshToken } = JSON.parse(storedAuth);
          keycloak.token = token;
          keycloak.refreshToken = refreshToken;

          // Validate the token by checking with Keycloak
          try {
            const isActive = await keycloak.updateToken(0); // Force token refresh check
            authenticated = isActive;
            console.log("Token validation result:", isActive);
          } catch (error) {
            console.error("Token validation failed:", error);
            authenticated = false;
            localStorage.removeItem("authState"); // Clear invalid state
          }
        }

        keycloak.authenticated = authenticated;
        authStateRef.current = { authenticated, token: keycloak.token || "", refreshToken: keycloak.refreshToken || "" };
        localStorage.setItem("authState", JSON.stringify(authStateRef.current));
        setInitialized(true);
        console.log("Keycloak initialized, authenticated:", authenticated);
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
        setInitError(error instanceof Error ? error : new Error("Unknown initialization error"));
        setInitialized(true);
      }
    };

    initializeKeycloak();
  }, [keycloak]);

  const updateAuthState = (authenticated: boolean, token?: string, refreshToken?: string) => {
    keycloak.authenticated = authenticated;
    keycloak.token = token || "";
    keycloak.refreshToken = refreshToken || "";
    authStateRef.current = { authenticated, token: keycloak.token, refreshToken: keycloak.refreshToken };
    localStorage.setItem("authState", JSON.stringify(authStateRef.current));
    console.log("Auth state updated, authenticated:", authenticated);
  };

  const ensureKeycloakMethods = () => {
    if (!keycloak.login || !keycloak.logout) {
      console.error("Keycloak methods missing, reinitializing...");
      Object.setPrototypeOf(keycloak, Keycloak.prototype);
    }
  };

  useEffect(() => {
    if (initialized) {
      ensureKeycloakMethods();
    }
  }, [initialized]);

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized, initError, updateAuthState }}>
      {children}
    </KeycloakContext.Provider>
  );
};