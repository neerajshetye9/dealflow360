
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  sales_rep: {
    id: 'u-rep-001',
    email: 'sales.rep@dealflow360.internal',
    fullName: 'Neeraj Shetye (Sales Rep)',
    role: 'sales_rep'
  },
  sales_manager: {
    id: 'u-mgr-002',
    email: 'sales.manager@dealflow360.internal',
    fullName: 'Atharva Shirke (Sales Manager)',
    role: 'sales_manager'
  },
  finance_director: {
    id: 'u-fin-003',
    email: 'finance.director@dealflow360.internal',
    fullName: 'Vignesh K (Finance Director)',
    role: 'finance_director'
  },
  admin: {
    id: 'u-adm-004',
    email: 'admin@dealflow360.internal',
    fullName: 'System Administrator',
    role: 'admin'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('sales_rep');
  const [user, setUser] = useState<User | null>(DEMO_USERS.sales_rep);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(DEMO_USERS[newRole]);
    localStorage.setItem('df360_role', newRole);
  };

  const login = (email: string, customRole: UserRole = 'sales_rep') => {
    switchRole(customRole);
  };

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem('df360_role') as UserRole;
    if (saved && DEMO_USERS[saved]) {
      switchRole(saved);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
