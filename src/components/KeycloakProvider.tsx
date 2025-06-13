"use client";

import React, { createContext, useEffect, useState } from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import keycloakConfig from './keycloakConfig';

interface KeycloakContextType {
  keycloak: KeycloakInstance | null;
  authenticated: boolean;
}

export const KeycloakContext = createContext<KeycloakContextType>({
  keycloak: null,
  authenticated: false,
});

interface KeycloakProviderProps {
  children: React.ReactNode;
}

const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    console.log('Keycloak config:', JSON.stringify(keycloakConfig, null, 2));
    const keycloakInstance: KeycloakInstance = new Keycloak(keycloakConfig);

    keycloakInstance
      .init({
        onLoad: 'login-required',
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
        console.error('Keycloak initialization failed:', JSON.stringify(error, null, 2) || 'Unknown error');
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

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export default KeycloakProvider;