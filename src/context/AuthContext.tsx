import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { User, UserRole } from '../types/index.ts';

interface AuthModalState {
  isOpen: boolean;
  mode: 'login' | 'register';
  defaultRole: 'customer' | 'worker';
}

interface AuthContextType {
  user: User | null;
  workerProfile: any | null;
  skills: any[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (type: 'customer' | 'worker_elec' | 'worker_plumb' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
  authModalState: AuthModalState;
  openAuthModal: (mode?: 'login' | 'register', defaultRole?: 'customer' | 'worker') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<any | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [authModalState, setAuthModalState] = useState<AuthModalState>({
    isOpen: false,
    mode: 'login',
    defaultRole: 'customer',
  });

  const openAuthModal = (mode: 'login' | 'register' = 'login', defaultRole: 'customer' | 'worker' = 'customer') => {
    setAuthModalState({ isOpen: true, mode, defaultRole });
  };

  const closeAuthModal = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('jobbond_token');
    if (!token) {
      setUser(null);
      setWorkerProfile(null);
      setSkills([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/api/auth/me');
      setUser(data.user);
      setWorkerProfile(data.worker_profile || null);
      setSkills(data.skills || []);
    } catch {
      localStorage.removeItem('jobbond_token');
      setUser(null);
      setWorkerProfile(null);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/api/auth/login', { email, password: pass });
    if (res.token) {
      localStorage.setItem('jobbond_token', res.token);
      await refreshUser();
      closeAuthModal();
    }
  };

  const register = async (payload: any) => {
    const res = await api.post('/api/auth/register', payload);
    if (res.token) {
      localStorage.setItem('jobbond_token', res.token);
      await refreshUser();
      closeAuthModal();
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('jobbond_token');
      setUser(null);
      setWorkerProfile(null);
      setSkills([]);
    }
  };

  const quickLogin = async (type: 'customer' | 'worker_elec' | 'worker_plumb' | 'admin') => {
    let email = '';
    let pass = 'Password123!';

    if (type === 'customer') {
      email = 'customer@jobbond.in';
    } else if (type === 'worker_elec') {
      email = 'rajesh.worker@jobbond.in';
    } else if (type === 'worker_plumb') {
      email = 'amit.worker@jobbond.in';
    } else if (type === 'admin') {
      email = 'admin@jobbond.in';
      pass = 'AdminPass123!';
    }

    await login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        skills,
        loading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
        authModalState,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
