"use client";

import React, { createContext, useEffect, useState } from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import keycloakConfig from './keycloakConfig';

interface KeycloakContextType {
  keycloak: KeycloakInstance | null;
  authenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
}

export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

interface KeycloakProviderProps {
  children: React.ReactNode;
}

const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  // Custom JWT parsing function
  const parseJwt = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to parse JWT:', e);
      return null;
    }
  };

  useEffect(() => {
    console.log('Keycloak config:', JSON.stringify(keycloakConfig, null, 2));
    const keycloakInstance: KeycloakInstance = new Keycloak(keycloakConfig);

    keycloakInstance
      .init({
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      })
      .then((auth) => {
        console.log('Keycloak initialized, authenticated:', auth);
        setKeycloak(keycloakInstance);
        setAuthenticated(auth);
      })
      .catch((error) => {
        console.error('Keycloak initialization failed:', JSON.stringify(error, null, 2));
        console.error('Config used:', JSON.stringify(keycloakConfig, null, 2));
      });

    const refreshToken = setInterval(() => {
      if (keycloakInstance) {
        keycloakInstance
          .updateToken(70)
          .then((refreshed) => {
            if (refreshed) {
              console.log('Token refreshed');
            }
          })
          .catch((err) => {
            console.error('Failed to refresh token:', JSON.stringify(err, null, 2));
          });
      }
    }, 60000);

    return () => clearInterval(refreshToken);
  }, []);

  const login = async (username: string, password: string) => {
    if (!keycloak) {
      throw new Error('Keycloak not initialized');
    }
    try {
      const response = await fetch(`${keycloakConfig.url}realms/${keycloakConfig.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: keycloakConfig.clientId,
          grant_type: 'password',
          username,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Authentication failed');
      }

      const token = await response.json();
      keycloak.token = token.access_token;
      keycloak.refreshToken = token.refresh_token;
      keycloak.tokenParsed = parseJwt(token.access_token);
      setAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, login }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;