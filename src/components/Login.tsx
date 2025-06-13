
/*import React, { createContext, useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';
import keycloakConfig from './keycloakConfig';

interface KeycloakContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
}

export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

const KeycloakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const keycloakInstance = new Keycloak(keycloakConfig);

    keycloakInstance
      .init({ onLoad: 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html', pkceMethod: 'S256' })
      .then((auth) => {
        setKeycloak(keycloakInstance);
        setAuthenticated(auth);
      })
      .catch((error) => {
        console.error('Keycloak initialization failed:', error);
      });

    // Refresh token every 60 seconds
    const refreshToken = setInterval(() => {
      if (keycloakInstance) {
        keycloakInstance.updateToken(70).catch(() => {
          console.error('Failed to refresh token');
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
*/