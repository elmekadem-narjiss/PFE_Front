"use client";

import { KeycloakProvider } from "@/context/KeycloakContext";
import { BatteryProvider } from "@/context/BatteryContext";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <KeycloakProvider>
      <BatteryProvider>
        <Navbar isOpen={isOpen} onToggle={toggleNavbar} />
        {children}
      </BatteryProvider>
    </KeycloakProvider>
  );
}