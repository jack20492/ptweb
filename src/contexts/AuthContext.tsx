import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'client';
  fullName: string;
  phone?: string;
  avatar?: string;
  currentPlan?: string;
  startDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize default admin account
    const users = JSON.parse(localStorage.getItem('pt_users') || '[]');
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@phinpt.com',
        role: 'admin',
        fullName: 'Phi Nguyễn PT',
        phone: '0123456789'
      };
      const userWithPassword = { ...defaultAdmin, password: 'admin123' };
      localStorage.setItem('pt_users', JSON.stringify([userWithPassword]));
    }

    // Check if user is logged in
    const savedUser = localStorage.getItem('pt_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('pt_users') || '[]');
    const foundUser = users.find((u: any) => 
      (u.username === username || u.email === username) && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('pt_current_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pt_current_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};