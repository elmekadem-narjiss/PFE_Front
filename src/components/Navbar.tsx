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
        {isOpen ? '✖' : '☰'} {/* Close (X) when open, Hamburger (☰) when closed */}
      </button>
      <nav className={`${styles.navbar} ${isOpen ? styles.open : ''}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <br></br> <br></br> <br></br> <br></br>
            <a href="/batteries" className={styles.navLink}>
              Batteries
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/dashboard" className={styles.navLink}>
              Predict-Service
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/reports" className={styles.navLink}>
              Reports
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/settings" className={styles.navLink}>
              Settings
            </a>
          </li>
          <li className={styles.navItem}>
            <a href="/dashboard/monitoring" className={styles.navLink}>
             Monitoring
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

