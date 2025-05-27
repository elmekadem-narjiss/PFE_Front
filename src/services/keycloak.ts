// src/services/keycloak.ts
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "myrealm",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "my-nodejs-client",
});

// Initialize Keycloak immediately at module load
let initialized = false;
let initError: Error | null = null;

keycloak.init({ onLoad: "check-sso", checkLoginIframe: false })
  .then(() => {
    initialized = true;
    console.log("Keycloak initialized:", keycloak.authenticated);
  })
  .catch((error: Error) => {
    console.error("Keycloak initialization failed:", error);
    initError = error;
    initialized = false;
  });

export { keycloak, initialized, initError };
////// testtttttt