"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeycloakContext } from "../../components/KeycloakProvider";
import EvaluationDisplay from "../../components/EvaluationDisplay";

export default function EvaluationPage() {
  const router = useRouter();
  const context = useContext(KeycloakContext);

  useEffect(() => {
    if (!context.authenticated) {
      router.push("/login");
    }
  }, [context, router]);

  if (!context.authenticated) {
    return null;
  }

  return <EvaluationDisplay />;
}