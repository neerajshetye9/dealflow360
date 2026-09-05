
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export interface AuthContextType {
  user: User | null;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  loginUser: (user: User) => void;
  registerUser: (newUser: User) => void;
  logout: () => void;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
}

export const SEEDED_PROFILES: Record<UserRole, User> = {
  sales_rep: {
    id: 'u-rep-001',
    email: 'neeraj.rep@dealflow360.com',
    fullName: 'Neeraj Shetye',
    role: 'sales_rep',
    territory: 'North America Enterprise',
    quota: 1500000
  },
  sales_manager: {
    id: 'u-mgr-002',
    email: 'atharva.mgr@dealflow360.com',
    fullName: 'Atharva Shirke',
    role: 'sales_manager',
    division: 'Enterprise Mid-Atlantic & West',
    approvalLimit: 100000
  },
  finance_director: {
    id: 'u-fin-003',
    email: 'vignesh.fin@dealflow360.com',
    fullName: 'Vignesh Shetty',
    role: 'finance_director',
    department: 'Revenue & Commercial Finance',
    costCenter: 'CC-FIN-982'
  },
  admin: {
    id: 'u-adm-004',
    email: 'admin@dealflow360.com',
    fullName: 'System Administrator',
    role: 'admin',
    department: 'Global Sales Operations'
  },
  customer: {
    id: 'u-cust-005',
    email: 'procurement@acmeglobal.com',
    fullName: 'Arthur Pendelton',
    role: 'customer',
    companyName: 'Acme Global Enterprises',
    portalToken: 'sample-portal-token'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('df360_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SEEDED_PROFILES.sales_rep;
  });

  const [role, setRole] = useState<UserRole>(user?.role || 'sales_rep');

  useEffect(() => {
    if (user) {
      setRole(user.role);
      localStorage.setItem('df360_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('df360_active_user');
    }
  }, [user]);

  const switchRole = (newRole: UserRole) => {
    // Check if user has custom registered profile for this role in storage
    const allUsersStr = localStorage.getItem('df360_registered_users');
    let customUser: User | undefined;
    if (allUsersStr) {
      try {
        const list: User[] = JSON.parse(allUsersStr);
        customUser = list.find(u => u.role === newRole);
      } catch (e) {}
    }
    const targetUser = customUser || SEEDED_PROFILES[newRole];
    setUser(targetUser);
    setRole(newRole);
  };

  const loginUser = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
  };

  const registerUser = (newUser: User) => {
    // Store in registered users list
    const allUsersStr = localStorage.getItem('df360_registered_users');
    let list: User[] = [];
    if (allUsersStr) {
      try { list = JSON.parse(allUsersStr); } catch (e) {}
    }
    list.push(newUser);
    localStorage.setItem('df360_registered_users', JSON.stringify(list));
    // Set as active user
    setUser(newUser);
    setRole(newUser.role);
  };

  const logout = () => {
    setUser(null);
  };

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admins have superuser bypass
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, loginUser, registerUser, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
