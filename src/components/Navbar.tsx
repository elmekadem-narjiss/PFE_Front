"use client";
import styles from './navbar.module.css';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Navbar({ isOpen, onToggle }: NavbarProps) {
  const { authenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <button className={styles.toggleButton} onClick={onToggle}>
        {isOpen ? '✖' : '☰'}
      </button>
      <nav className={`${styles.navbar} ${isOpen ? styles.open : ''}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <br /><br /><br /><br />
            <a href="/batteries" className={styles.navLink}>
            <b> Batteries</b>  
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/dashboard" className={styles.navLink}>
              <b> Predict-Service</b> 
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
              <b> ToDoList </b>
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/chat" className={styles.navLink}>
              <b>Equip_Chat</b>
            </a>
          </li>
          {authenticated && (
            <li className={styles.navItem}>
              <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutButton}`}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}