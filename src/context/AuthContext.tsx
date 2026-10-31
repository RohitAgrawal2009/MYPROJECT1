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
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string; preview_code?: string; cooldown?: number; phone?: string; message?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string; is_new_user?: boolean; needs_role_selection?: boolean }>;
  setUserRole: (role: 'customer' | 'worker') => Promise<void>;
  completeProfile: (payload: any) => Promise<void>;
  updateAvailability: (status: 'available' | 'busy' | 'unavailable') => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (type: 'customer' | 'worker_elec' | 'worker_plumb' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
  authModalState: AuthModalState;
  openAuthModal: (mode?: 'login' | 'register', defaultRole?: 'customer' | 'worker') => void;
  closeAuthModal: () => void;
  // Onboarding workflow state
  onboardingStep: 'login' | 'user_type' | 'profile_setup' | null;
  setOnboardingStep: (step: 'login' | 'user_type' | 'profile_setup' | null) => void;
  pendingMobile: string;
  setPendingMobile: (phone: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<any | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboarding flow state
  const [onboardingStep, setOnboardingStep] = useState<'login' | 'user_type' | 'profile_setup' | null>(null);
  const [pendingMobile, setPendingMobile] = useState<string>('');

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

      // If user has not completed onboarding, route them to user_type or profile_setup
      if (data.user && !data.user.onboarding_completed) {
        if (!data.user.role || data.user.full_name?.startsWith('Worker / Customer')) {
          setOnboardingStep('user_type');
        } else {
          setOnboardingStep('profile_setup');
        }
      }
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
      setOnboardingStep(null);
    }
  };

  const register = async (payload: any) => {
    const res = await api.post('/api/auth/register', payload);
    if (res.token) {
      localStorage.setItem('jobbond_token', res.token);
      await refreshUser();
      closeAuthModal();
      setOnboardingStep(null);
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await api.post('/api/auth/otp/send', { phone });
      setPendingMobile(res.phone || phone);
      return {
        success: true,
        preview_code: res.preview_code,
        cooldown: res.cooldown || 60,
        phone: res.phone || phone,
        message: res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to send OTP. Please check your phone number.',
        cooldown: err.response?.data?.cooldown,
      };
    }
  };

  const verifyOtp = async (phone: string, code: string) => {
    try {
      const res = await api.post('/api/auth/otp/verify', { phone, code });
      if (res.token) {
        localStorage.setItem('jobbond_token', res.token);
        setUser(res.user);
        setWorkerProfile(res.worker_profile || null);
        setSkills(res.skills || []);

        if (res.needs_role_selection || res.is_new_user) {
          setOnboardingStep('user_type');
        } else {
          setOnboardingStep(null);
        }

        return {
          success: true,
          is_new_user: res.is_new_user,
          needs_role_selection: res.needs_role_selection,
        };
      }
      return { success: false, error: 'Failed to verify session' };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Invalid or expired OTP. Please try again.',
      };
    }
  };

  const setUserRole = async (role: 'customer' | 'worker') => {
    const res = await api.post('/api/auth/onboarding/role', { role });
    setUser(res.user);
    if (res.worker_profile) {
      setWorkerProfile(res.worker_profile);
    }
    setOnboardingStep('profile_setup');
  };

  const completeProfile = async (payload: any) => {
    const res = await api.post('/api/auth/onboarding/profile', payload);
    setUser(res.user);
    if (res.worker_profile) {
      setWorkerProfile(res.worker_profile);
    }
    if (res.skills) {
      setSkills(res.skills);
    }
    setOnboardingStep(null);
  };

  const updateAvailability = async (status: 'available' | 'busy' | 'unavailable') => {
    const res = await api.patch('/api/worker/availability', { availability_status: status });
    if (res.worker_profile) {
      setWorkerProfile(res.worker_profile);
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
      setOnboardingStep(null);
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
        sendOtp,
        verifyOtp,
        setUserRole,
        completeProfile,
        updateAvailability,
        logout,
        quickLogin,
        refreshUser,
        authModalState,
        openAuthModal,
        closeAuthModal,
        onboardingStep,
        setOnboardingStep,
        pendingMobile,
        setPendingMobile,
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
