import { useState, useEffect } from "react";
import keycloak from "../services/keycloak";

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: "login-required", checkLoginIframe: false }).then((auth) => {
      setAuthenticated(auth);
      console.log("Authentication successful:", auth);
      console.log("Keycloak token:", keycloak.token);
      if (auth && keycloak.token) {
        localStorage.setItem("token", keycloak.token);
        console.log("Token stored in localStorage:", keycloak.token);
      } else {
        console.log("No valid token received. Authentication details:", keycloak.authenticated, keycloak.token);
      }
    }).catch((error) => {
      console.error("Keycloak initialization error:", error);
    });
  }, []);
  const login = () => {
    keycloak.login({ redirectUri: window.location.origin + "/login" });
  };

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
    localStorage.removeItem("token");
    setAuthenticated(false);
  };

  return { authenticated, login, logout };
};