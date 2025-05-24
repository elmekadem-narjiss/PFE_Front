"use client";

import { useEffect } from "react";
import styles from "./navbar.module.css";
import { useKeycloak } from "@/context/KeycloakContext";

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Navbar({ isOpen, onToggle }: NavbarProps) {
  const { keycloak, initialized, initError, isAuthenticated } = useKeycloak();

  useEffect(() => {
    console.log("Navbar - Initial State:", {
      initialized,
      authenticated: keycloak?.authenticated,
      initError: initError?.message,
      keycloakInstance: keycloak ? "Available" : "Not Available",
    });

    if (initialized && keycloak) {
      console.log("Navbar - Keycloak Details:", {
        authenticated: keycloak.authenticated,
        token: keycloak.token ? "Present" : "Absent",
        refreshToken: keycloak.refreshToken ? "Present" : "Absent",
        hasLogoutMethod: typeof keycloak.logout === "function" ? "Yes" : "No",
      });
    }
  }, [initialized, keycloak, initError]);

  useEffect(() => {
    if (initialized) {
      console.log("Navbar - Authenticated State Changed:", keycloak?.authenticated);
    }
  }, [initialized, keycloak?.authenticated]);

  if (!initialized) {
    console.log("Navbar - Rendering Loading State due to !initialized");
    return <div>Loading...</div>;
  }

  if (initError) {
    console.log("Navbar - Rendering Error State:", initError.message);
    return <div>Error initializing Keycloak: {initError.message}</div>;
  }

  const handleLogout = () => {
    console.log("Navbar - Initiating Logout");
    if (keycloak && typeof keycloak.logout === "function") {
      keycloak.logout({ redirectUri: "http://localhost:3000/login" });
      localStorage.removeItem("authState");
      console.log("Navbar - Logout completed, authState removed from localStorage");
    } else {
      console.error("Navbar - Error: Keycloak logout method not available");
      localStorage.removeItem("authState");
      window.location.href = "http://localhost:3000/login";
    }
  };

  console.log("Navbar - Rendering with authenticated:", keycloak.authenticated);

  return (
    <>
      <button className={styles.toggleButton} onClick={onToggle}>
        {isOpen ? "✖" : "☰"}
      </button>
      <nav className={`${styles.navbar} ${isOpen ? styles.open : ""}`}>
        <ul className={styles.navList}>
          {!isAuthenticated() && (
            <li className={styles.navItem}>
              <span className={styles.navLink} style={{ color: "gray", cursor: "not-allowed" }}>
                <b>Please log in to access the app</b>
              </span>
            </li>
          )}
          {isAuthenticated() && (
            <>
              <li className={styles.navItem}>
                <a href="/batteries" className={styles.navLink}>
                  <b>Batteries</b>
                </a>
              </li>
              <li className={styles.navItem}>
                <a href="/dashboard" className={styles.navLink}>
                  <b>Predict-Service</b>
                </a>
              </li>
              <li className={styles.navItem}>
                <a href="/reports" className={styles.navLink}>
                  <b>Reports</b>
                </a>
              </li>
              <li className={styles.navItem}>
                <a href="/settings" className={styles.navLink}>
                  <b>Settings</b>
                </a>
              </li>
              <li className={styles.navItem}>
                <a href="/dashboard/monitoring" className={styles.navLink}>
                  <b>Monitoring</b>
                </a>
              </li>
              <li className={styles.navItem}>
                <a href="/todolist" className={styles.navLink}>
                  <b>ToDoList</b>
                </a>
              </li>
              <li className={styles.navItem}>
                <a href="/chat" className={styles.navLink}>
                  <b>Equip_Chat</b>
                </a>
              </li>
              <li className={styles.navItem}>
                <button
                  onClick={handleLogout}
                  className={`${styles.navLink} ${styles.logoutButton}`}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
}