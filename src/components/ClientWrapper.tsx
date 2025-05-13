'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { BatteryProvider } from '@/context/BatteryContext';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isOpen]);

  return (
    <BatteryProvider>
      <Navbar onToggle={toggleMenu} isOpen={isOpen} />
      <main>{children}</main>
    </BatteryProvider>
  );
}