// CMS Authentication Context — sunucu tabanlı (PHP oturum çerezi + CSRF).
// useAuth() arayüzü AYNI kalır; CMSLogin/CMSLayout değişmez.
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api, setCsrfToken, onUnauthorized, ApiError, type AuthUser } from '@/lib/api';

type User = AuthUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Açılışta /api/auth/me ile oturumu yeniden kur.
  useEffect(() => {
    let active = true;
    api.auth.me()
      .then((res) => {
        if (!active) return;
        if (res.authenticated && res.user) {
          setUser(res.user);
          setCsrfToken(res.csrfToken);
        } else {
          setUser(null);
          setCsrfToken(null);
        }
      })
      .catch(() => {
        if (active) { setUser(null); setCsrfToken(null); }
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  // Herhangi bir istek 401 dönerse oturumu düşür.
  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      setCsrfToken(null);
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await api.auth.login(username, password);
      setUser(res.user);
      setCsrfToken(res.csrfToken);
      return { success: true };
    } catch (e) {
      const err = e as ApiError;
      if (err.code === 'TOO_MANY_ATTEMPTS') {
        return { success: false, error: 'Çok fazla deneme. Lütfen biraz bekleyin.' };
      }
      return { success: false, error: err.message || 'Kullanıcı adı veya şifre hatalı' };
    }
  }, []);

  const logout = useCallback(() => {
    // Yerel durumu hemen temizle (çerez sunucuda yok edilir).
    setUser(null);
    setCsrfToken(null);
    api.auth.logout().catch(() => { /* yoksay */ });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
