
"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { KeycloakContext } from "../components/KeycloakProvider";

export default function Home() {
  const router = useRouter();
  const context = useContext(KeycloakContext);

  useEffect(() => {
    console.log('page.tsx: Authenticated:', context.authenticated);
    if (context.authenticated) {
      router.push("/todolist");
    }
  }, [context, router]);

  return null;
}