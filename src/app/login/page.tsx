"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeycloakContext } from '../../components/KeycloakProvider';
import styles from './login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const keycloakContext = useContext(KeycloakContext);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keycloakContext?.login) {
      setError('Authentication service not available');
      return;
    }

    try {
      await keycloakContext.login(username, password);
      router.push('/todolist');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    }
  };

  useEffect(() => {
    console.log('Login component mounted, checking image path:', window.location.origin + '/nelai-logo.jpg');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <img
          src="/nelai-logo.jpg"
          alt="Nelai Logo"
          className={styles.logo}
          onError={(e) => {
            console.log('Image load error:', {
              event: e,
              src: e.currentTarget.src,
              status: e.currentTarget.naturalWidth === 0 ? '404 or invalid' : 'other error',
            });
          }}
          onLoad={() => console.log('Image loaded successfully:', window.location.origin + '/nelai-logo.jpg')}
        />
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton}>Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;