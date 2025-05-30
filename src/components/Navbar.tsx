'use client';

import styles from './navbar.module.css';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Navbar({ isOpen, onToggle }: NavbarProps) {
  return (
    <>
      <button className={styles.toggleButton} onClick={onToggle}>
        {isOpen ? '✖' : '☰'}
      </button>
      <nav className={`${styles.navbar} ${isOpen ? styles.open : ''}`}>
        <ul className={styles.navList}>
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
            <a href="/batteries/evaluation" className={styles.navLink}>
              <b>Decision</b>
            </a>
          </li>

        </ul>
      </nav>
    </>
  );
}

