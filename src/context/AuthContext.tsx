import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, AcademicLevel } from '../types';
import { apiClient } from '../services/apiClient';

const CANDIDATE_TOKEN_KEY = 'mapolycbe_candidate_token_v1';
const CANDIDATE_USER_KEY = 'mapolycbe_candidate_user_v1';
const ADMIN_TOKEN_KEY = 'mapolycbe_admin_token_v1';
const ADMIN_USER_KEY = 'mapolycbe_admin_user_v1';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Specific role states
  candidateUser: User | null;
  adminUser: User | null;
  candidateToken: string | null;
  adminToken: string | null;

  // Actions
  login: (token: string, user: User, role?: Role) => void;
  loginCandidate: (matricNoOrEmail: string, password?: string) => Promise<User>;
  registerCandidate: (data: {
    matric_no?: string;
    full_name?: string;
    name?: string;
    email: string;
    password?: string;
    level: AcademicLevel;
    phone?: string;
    department?: string;
  }) => Promise<User>;
  loginAdmin: (usernameOrEmail: string, password?: string) => Promise<User>;
  logoutCandidate: () => void;
  logoutAdmin: () => void;
  logout: () => void;
  switchActiveRole: (targetRole: Role | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidateUser, setCandidateUser] = useState<User | null>(null);
  const [candidateToken, setCandidateToken] = useState<string | null>(null);

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Active viewing context (defaults to candidate if logged in, or admin if on admin routes)
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore sessions from isolated storage keys
  useEffect(() => {
    try {
      const storedCandToken = localStorage.getItem(CANDIDATE_TOKEN_KEY);
      const storedCandUser = localStorage.getItem(CANDIDATE_USER_KEY);
      if (storedCandToken && storedCandUser) {
        setCandidateToken(storedCandToken);
        setCandidateUser(JSON.parse(storedCandUser));
      }

      const storedAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const storedAdminUser = localStorage.getItem(ADMIN_USER_KEY);
      if (storedAdminToken && storedAdminUser) {
        setAdminToken(storedAdminToken);
        setAdminUser(JSON.parse(storedAdminUser));
      }

      // Check current route to determine primary active role
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && storedAdminToken) {
        setActiveRole('admin');
      } else if (storedCandToken) {
        setActiveRole('candidate');
      } else if (storedAdminToken) {
        setActiveRole('admin');
      } else {
        setActiveRole(null);
      }
    } catch (e) {
      console.error('Error hydrating auth state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, user: User, role?: Role) => {
    const targetRole = role || user.role || 'candidate';
    if (targetRole === 'admin') {
      setAdminUser(user);
      setAdminToken(token);
      setActiveRole('admin');
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    } else {
      setCandidateUser(user);
      setCandidateToken(token);
      setActiveRole('candidate');
      localStorage.setItem(CANDIDATE_TOKEN_KEY, token);
      localStorage.setItem(CANDIDATE_USER_KEY, JSON.stringify(user));
    }
  };

  const loginCandidate = async (matricNoOrEmail: string, password?: string): Promise<User> => {
    const res = await apiClient.loginCandidate(matricNoOrEmail, password);
    setCandidateUser(res.user);
    setCandidateToken(res.token);
    setActiveRole('candidate');
    localStorage.setItem(CANDIDATE_TOKEN_KEY, res.token);
    localStorage.setItem(CANDIDATE_USER_KEY, JSON.stringify(res.user));
    return res.user;
  };

  const registerCandidate = async (data: {
    matric_no?: string;
    full_name?: string;
    name?: string;
    email: string;
    phone?: string;
    department?: string;
    password?: string;
    level: AcademicLevel;
  }): Promise<User> => {
    const matricNo = data.matric_no || `CBT/2026/CS/${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = data.full_name || data.name || 'Candidate';
    const res = await apiClient.registerCandidate({
      matric_no: matricNo,
      full_name: fullName,
      email: data.email,
      password: data.password || 'Candidate@123!',
      level: data.level,
    });
    setCandidateUser(res.user);
    setCandidateToken(res.token);
    setActiveRole('candidate');
    localStorage.setItem(CANDIDATE_TOKEN_KEY, res.token);
    localStorage.setItem(CANDIDATE_USER_KEY, JSON.stringify(res.user));
    return res.user;
  };

  const loginAdmin = async (usernameOrEmail: string, password?: string): Promise<User> => {
    const res = await apiClient.loginAdmin(usernameOrEmail, password);
    setAdminUser(res.user);
    setAdminToken(res.token);
    setActiveRole('admin');
    localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.user));
    return res.user;
  };

  const logoutCandidate = () => {
    setCandidateUser(null);
    setCandidateToken(null);
    localStorage.removeItem(CANDIDATE_TOKEN_KEY);
    localStorage.removeItem(CANDIDATE_USER_KEY);
    if (activeRole === 'candidate') {
      setActiveRole(adminToken ? 'admin' : null);
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    if (activeRole === 'admin') {
      setActiveRole(candidateToken ? 'candidate' : null);
    }
  };

  const logout = () => {
    if (activeRole === 'admin') {
      logoutAdmin();
    } else {
      logoutCandidate();
    }
  };

  const switchActiveRole = (targetRole: Role | null) => {
    setActiveRole(targetRole);
  };

  // Derive current active user and token based on activeRole
  const currentUser = activeRole === 'admin' ? adminUser : activeRole === 'candidate' ? candidateUser : null;
  const currentToken = activeRole === 'admin' ? adminToken : activeRole === 'candidate' ? candidateToken : null;
  const isAuthenticated = Boolean(currentToken && currentUser);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: activeRole,
        token: currentToken,
        isAuthenticated,
        isLoading,
        candidateUser,
        adminUser,
        candidateToken,
        adminToken,
        login,
        loginCandidate,
        registerCandidate,
        loginAdmin,
        logoutCandidate,
        logoutAdmin,
        logout,
        switchActiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
