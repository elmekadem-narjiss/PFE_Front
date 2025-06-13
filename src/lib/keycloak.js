// lib/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/auth', // Remplacez par l'URL de votre serveur Keycloak
  realm: 'votre-realm',
  clientId: 'votre-client-id',
});

export default keycloak;