"use client";

import Keycloak from "keycloak-js";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

// Normalize the URL to ensure a trailing slash
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
  isAuthenticated: () => boolean;
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

        authenticated = await keycloak.init({ onLoad: "check-sso", checkLoginIframe: false }).catch((err) => {
          console.error("Keycloak init failed:", err);
          return false;
        });

        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          const { token, refreshToken } = parsedAuth;

          // Validate that token and refreshToken exist before proceeding
          if (token && refreshToken) {
            keycloak.token = token;
            keycloak.refreshToken = refreshToken;
            try {
              const isActive = await keycloak.updateToken(0); // Validate token
              authenticated = isActive;
              console.log("Token validation result:", isActive);
            } catch (error) {
              console.error("Token validation failed:", error || "Unknown error");
              authenticated = false;
              localStorage.removeItem("authState"); // Clear invalid state
            }
          } else {
            console.error("Invalid stored auth state, missing token or refreshToken:", parsedAuth);
            authenticated = false;
            localStorage.removeItem("authState"); // Clear invalid state
          }
        }

        keycloak.authenticated = authenticated ?? false;
        authStateRef.current = { authenticated: keycloak.authenticated, token: keycloak.token || "", refreshToken: keycloak.refreshToken || "" };
        localStorage.setItem("authState", JSON.stringify(authStateRef.current));
        setInitialized(true);
        console.log("Keycloak initialized, authenticated:", keycloak.authenticated);
      } catch (error) {
        console.error("Keycloak initialization failed:", error || "Unknown error");
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
    // Set a cookie for middleware to check
    document.cookie = `auth=${authenticated}; path=/`;
    console.log("Auth state updated, authenticated:", authenticated);
  };

  const ensureKeycloakMethods = () => {
    if (!keycloak.login || !keycloak.logout) {
      console.error("Keycloak methods missing, reinitializing...");
      Object.setPrototypeOf(keycloak, Keycloak.prototype);
    }
  };

  const isAuthenticated = (): boolean => {
    if (!initialized || !keycloak) {
      return false;
    }
    return keycloak.authenticated !== undefined ? keycloak.authenticated : false;
  };

  useEffect(() => {
    if (initialized) {
      ensureKeycloakMethods();
    }
  }, [initialized]);

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized, initError, updateAuthState, isAuthenticated }}>
      {children}
    </KeycloakContext.Provider>
  );
};