import { createContext, useContext, useState, ReactNode } from 'react';

export type UserType = 'student' | 'teacher';

interface User {
  email: string;
  type: UserType;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, type: UserType) => void;
  logout: () => void;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, type: UserType) => {
    setUser({
      email,
      type,
      name: email.split('@')[0]
    });
  };

  const logout = () => {
    setUser(null);
  };

  const isTeacher = user?.type === 'teacher';
  const isStudent = user?.type === 'student';

  return (
    <AuthContext.Provider value={{ user, login, logout, isTeacher, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
