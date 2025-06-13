"use client";

import React, { useContext } from 'react';
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

  return (
    <>
      <button className={styles.toggleButton} onClick={onToggle}>
        {isOpen ? '✖' : '☰'}
      </button>
      <nav className={`${styles.navbar} ${isOpen ? styles.open : ''}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <br />
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
            <a href="/batteries/evaluation" className={styles.navLink}>
              <b>Decision</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/fournisseur" className={styles.navLink}>
              <b>Manage_Energie</b>
            </a>
          </li>
          <li className={styles.navItem}>
            <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutButton}`}>
              <b>Logout</b>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}