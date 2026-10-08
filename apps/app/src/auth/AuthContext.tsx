import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getMe,
  getToken,
  requestOtp as apiRequestOtp,
  setToken as persistToken,
  updateMe,
  verifyOtp as apiVerifyOtp,
} from "../api/client";
import type { User } from "../api/types";

type AuthState = {
  token: string | null;
  user: User | null;
  /** Ilova birinchi marta ochilganda saqlangan tokenni tekshirish davri */
  loading: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<User>;
  updateRegion: (regionId: number) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!getToken());

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let active = true;
    getMe(token).then((u) => {
      if (!active) return;
      if (u) {
        setUser(u);
      } else {
        // Token eskirgan/yaroqsiz — tozalaymiz
        persistToken(null);
        setTokenState(null);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [token]);

  const requestOtp = async (phone: string) => {
    await apiRequestOtp(phone);
  };

  const verifyOtp = async (phone: string, code: string) => {
    const { accessToken, user: u } = await apiVerifyOtp(phone, code);
    persistToken(accessToken);
    setTokenState(accessToken);
    setUser(u);
    return u;
  };

  const updateRegion = async (regionId: number) => {
    if (!token) throw new Error("Avval tizimga kiring");
    const u = await updateMe(token, { regionId });
    setUser(u);
  };

  const logout = () => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, requestOtp, verifyOtp, updateRegion, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth faqat <AuthProvider> ichida ishlatiladi");
  return ctx;
}
