import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { setUnauthorizedHandler } from '@/api';
import { authApi } from '@/features/auth/services/authApi';
import { clearAccessToken, getAccessToken, getStoredSession, saveSession } from './tokenStorage';
import type { StoredSession } from './tokenStorage';

const TOKEN_DURATION_MS = 8 * 60 * 60 * 1000;

interface SessionContextValue {
  session: StoredSession | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (nombreCompleto: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Estado compartido de RF-01. La expiración local facilita la navegación, pero el
 * backend sigue siendo la autoridad: cualquier 401 protegido elimina la sesión.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await clearAccessToken();
    } finally {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getStoredSession()
      .then((restored) => { if (active) setSession(restored); })
      .catch(() => { if (active) setSession(null); })
      .finally(() => { if (active) setLoading(false); });

    setUnauthorizedHandler(async (requestToken) => {
      const currentToken = await getAccessToken();
      if (!currentToken || currentToken === requestToken) await logout();
    });
    return () => {
      active = false;
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  useEffect(() => {
    if (!session) return;
    const timeout = setTimeout(() => { void logout().catch(() => {}); }, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timeout);
  }, [logout, session]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    const next: StoredSession = {
      token: response.token,
      username,
      nombreCompleto: response.nombreCompleto,
      rol: response.rol,
      expiresAt: Date.now() + TOKEN_DURATION_MS,
    };
    await saveSession(next);
    setSession(next);
  }, []);

  /** Refleja el cambio de nombre de la propia cuenta sin alterar el token ni el rol. */
  const updateName = useCallback(async (nombreCompleto: string) => {
    if (!session) return;
    const updated = { ...session, nombreCompleto };
    await saveSession(updated);
    setSession(updated);
  }, [session]);

  const value = useMemo(
    () => ({ session, loading, login, logout, updateName }),
    [session, loading, login, logout, updateName],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Hook único para consultar sesión y permisos visuales desde las pantallas. */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession requiere SessionProvider');
  return context;
}
