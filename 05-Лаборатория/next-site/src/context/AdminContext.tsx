'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Проверяем ключ при загрузке (только на клиенте)
    const key = localStorage.getItem('admin_key');
    if (key === 'straus') {
      setIsAdmin(true);
    }
  }, []);

  const login = () => {
    localStorage.setItem('admin_key', 'straus');
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_key');
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
