"use client";

import React, { useContext, useEffect } from 'react';
import styles from './navbar.module.css';
import { KeycloakContext } from './KeycloakProvider';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Navbar({ isOpen, onToggle }: NavbarProps) {
  const keycloakContext = useContext(KeycloakContext);

  const handleLogout = () => {
    if (keycloakContext?.keycloak) {
      console.log('Initiating Keycloak logout');
      keycloakContext.keycloak.logout({ redirectUri: window.location.origin + '/' });
    } else {
      console.error('Keycloak instance not available');
    }
  };

  useEffect(() => {
    const img = new Image();
    img.src = '/nelai-logo.jpg';
    img.onload = () => console.log('Image preloaded successfully');
    img.onerror = () => console.log('Image preloading failed');
  }, []);

  return (
    <>
      <button className={styles.toggleButton} onClick={onToggle}>
        {isOpen ? '✖' : '☰'}
      </button>
      <nav className={`${styles.navbar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logoContainer}>
          <img src="https://i.pinimg.com/736x/9e/5c/42/9e5c4240297cf781948320b176e7a394.jpg" className={styles.logo} />
          <span className={styles.logoText}>nelai</span>
        </div>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a href="/batteries" className={styles.navLink}>
              <span>🔋</span> <b>Batteries</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/dashboard" className={styles.navLink}>
              <span>📊</span> <b>Predict-Service</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/reports" className={styles.navLink}>
              <span>📝</span> <b>Reports</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/settings" className={styles.navLink}>
              <span>⚙️</span> <b>Settings</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/dashboard/monitoring" className={styles.navLink}>
              <span>👁️</span> <b>Monitoring</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/todolist" className={styles.navLink}>
              <span>📋</span> <b>ToDoList</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/chat" className={styles.navLink}>
              <span>💬</span> <b>Equip_Chat</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/batteries/evaluation" className={styles.navLink}>
              <span>✅</span> <b>Decision</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/fournisseur" className={styles.navLink}>
              <span>⚡</span> <b>Manage_Energie</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutButton}`}>
              <img src="https://cdn-icons-png.flaticon.com/512/126/126467.png" alt="Logout Icon" className={styles.logoutIcon} />
              <b>Logout</b>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}