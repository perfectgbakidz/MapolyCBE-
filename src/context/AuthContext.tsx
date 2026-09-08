import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, AcademicLevel, ParentUser, ParentRegisterPayload, ChildMatch } from '../types';
import { apiClient } from '../services/apiClient';

const CANDIDATE_TOKEN_KEY = 'mapolycbe_candidate_token_v1';
const CANDIDATE_USER_KEY = 'mapolycbe_candidate_user_v1';
const ADMIN_TOKEN_KEY = 'mapolycbe_admin_token_v1';
const ADMIN_USER_KEY = 'mapolycbe_admin_user_v1';
const PARENT_TOKEN_KEY = 'mapolycbe_parent_token_v1';
const PARENT_USER_KEY = 'mapolycbe_parent_user_v1';

interface AuthContextType {
  user: User | ParentUser | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Specific role states
  candidateUser: User | null;
  adminUser: User | null;
  parentUser: ParentUser | null;
  candidateToken: string | null;
  adminToken: string | null;
  parentToken: string | null;

  // Actions
  login: (token: string, user: User | ParentUser, role?: Role) => void;
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
  loginParent: (identifier: string, password?: string) => Promise<ParentUser>;
  registerParent: (data: ParentRegisterPayload) => Promise<{ user: ParentUser; children: ChildMatch[] }>;
  logoutCandidate: () => void;
  logoutAdmin: () => void;
  logoutParent: () => void;
  logout: () => void;
  switchActiveRole: (targetRole: Role | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidateUser, setCandidateUser] = useState<User | null>(null);
  const [candidateToken, setCandidateToken] = useState<string | null>(null);

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const [parentUser, setParentUser] = useState<ParentUser | null>(null);
  const [parentToken, setParentToken] = useState<string | null>(null);

  // Active viewing context (defaults to candidate if logged in, or admin/parent depending on route)
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

      const storedParentToken = localStorage.getItem(PARENT_TOKEN_KEY);
      const storedParentUser = localStorage.getItem(PARENT_USER_KEY);
      if (storedParentToken && storedParentUser) {
        setParentToken(storedParentToken);
        setParentUser(JSON.parse(storedParentUser));
      }

      // Check current route to determine primary active role
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && storedAdminToken) {
        setActiveRole('admin');
      } else if (currentPath.startsWith('/parent') && storedParentToken) {
        setActiveRole('parent');
      } else if (storedCandToken) {
        setActiveRole('candidate');
      } else if (storedParentToken) {
        setActiveRole('parent');
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

  const login = (token: string, user: User | ParentUser, role?: Role) => {
    const targetRole = role || user.role || 'candidate';
    if (targetRole === 'admin') {
      setAdminUser(user as User);
      setAdminToken(token);
      setActiveRole('admin');
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    } else if (targetRole === 'parent') {
      setParentUser(user as ParentUser);
      setParentToken(token);
      setActiveRole('parent');
      localStorage.setItem(PARENT_TOKEN_KEY, token);
      localStorage.setItem(PARENT_USER_KEY, JSON.stringify(user));
    } else {
      setCandidateUser(user as User);
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

  const loginParent = async (identifier: string, password?: string): Promise<ParentUser> => {
    const res = await apiClient.loginParent(identifier, password);
    setParentUser(res.user);
    setParentToken(res.token);
    setActiveRole('parent');
    localStorage.setItem(PARENT_TOKEN_KEY, res.token);
    localStorage.setItem(PARENT_USER_KEY, JSON.stringify(res.user));
    return res.user;
  };

  const registerParent = async (data: ParentRegisterPayload): Promise<{ user: ParentUser; children: ChildMatch[] }> => {
    const res = await apiClient.registerParent(data);
    setParentUser(res.user);
    setParentToken(res.token);
    setActiveRole('parent');
    localStorage.setItem(PARENT_TOKEN_KEY, res.token);
    localStorage.setItem(PARENT_USER_KEY, JSON.stringify(res.user));
    return { user: res.user, children: res.children };
  };

  const logoutCandidate = () => {
    setCandidateUser(null);
    setCandidateToken(null);
    localStorage.removeItem(CANDIDATE_TOKEN_KEY);
    localStorage.removeItem(CANDIDATE_USER_KEY);
    if (activeRole === 'candidate') {
      setActiveRole(parentToken ? 'parent' : adminToken ? 'admin' : null);
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    if (activeRole === 'admin') {
      setActiveRole(candidateToken ? 'candidate' : parentToken ? 'parent' : null);
    }
  };

  const logoutParent = () => {
    setParentUser(null);
    setParentToken(null);
    localStorage.removeItem(PARENT_TOKEN_KEY);
    localStorage.removeItem(PARENT_USER_KEY);
    if (activeRole === 'parent') {
      setActiveRole(candidateToken ? 'candidate' : adminToken ? 'admin' : null);
    }
  };

  const logout = () => {
    if (activeRole === 'admin') {
      logoutAdmin();
    } else if (activeRole === 'parent') {
      logoutParent();
    } else {
      logoutCandidate();
    }
  };

  const switchActiveRole = (targetRole: Role | null) => {
    setActiveRole(targetRole);
  };

  // Derive current active user and token based on activeRole
  const currentUser =
    activeRole === 'admin'
      ? adminUser
      : activeRole === 'parent'
      ? parentUser
      : activeRole === 'candidate'
      ? candidateUser
      : null;

  const currentToken =
    activeRole === 'admin'
      ? adminToken
      : activeRole === 'parent'
      ? parentToken
      : activeRole === 'candidate'
      ? candidateToken
      : null;

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
        parentUser,
        candidateToken,
        adminToken,
        parentToken,
        login,
        loginCandidate,
        registerCandidate,
        loginAdmin,
        loginParent,
        registerParent,
        logoutCandidate,
        logoutAdmin,
        logoutParent,
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
