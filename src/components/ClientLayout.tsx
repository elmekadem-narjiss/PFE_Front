"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { BatteryProvider } from "@/context/BatteryContext";
import { KeycloakProvider } from "@/context/KeycloakContext";
import { SettingsProvider } from "@/context/SettingsContext"; // Add this import

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <KeycloakProvider>
      <SettingsProvider>
        <BatteryProvider>
          <Navbar isOpen={isOpen} onToggle={toggleNavbar} />
          {children}
        </BatteryProvider>
      </SettingsProvider>
    </KeycloakProvider>
  );
}