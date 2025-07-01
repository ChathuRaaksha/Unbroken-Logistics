"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'Driver' | 'Dock Worker' | 'Warehouse Staff';
type User = {
  username: string;
  role: Role;
};
export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isOnline: boolean;
  lastSyncTime: number | null;
  setLastSyncTime: (time: number) => void;
  setIsOnline: (status: boolean) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const mockUsers: Record<string, { password: string; role: Role }> = {
  driver_01: { password: 'pass123', role: 'Driver' },
  dock_01: { password: 'pass123', role: 'Dock Worker' },
  wh_01: { password: 'pass123', role: 'Warehouse Staff' },
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('rolecall_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userData = mockUsers[username];
            if (userData && userData.password === password) {
                const loggedInUser = { username, role: userData.role };
                setUser(loggedInUser);
                localStorage.setItem('rolecall_user', JSON.stringify(loggedInUser));
                resolve(true);
            } else {
                resolve(false);
            }
        }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rolecall_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isOnline, setIsOnline, lastSyncTime, setLastSyncTime }}>
      {children}
    </AuthContext.Provider>
  );
};
