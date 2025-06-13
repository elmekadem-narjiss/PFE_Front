"use client";

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeycloakContext } from '../components/KeycloakProvider';

export default function Home() {
  const keycloakContext = useContext(KeycloakContext);
  const router = useRouter();

  useEffect(() => {
    if (!keycloakContext) {
      console.log('page.tsx: KeycloakContext not initialized, waiting...');
      return; // Wait for KeycloakContext to initialize
    }

    console.log('page.tsx: Authenticated:', keycloakContext.authenticated);
    if (keycloakContext.authenticated) {
      router.push('/todolist'); // Redirect authenticated users to /evaluation
    } else {
      router.push('/login'); // Redirect unauthenticated users to /login
    }
  }, [keycloakContext, router]);

  return null; // Render nothing while redirecting
}