"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuthPrivy } from "@/lib/hooks/use-auth-privy";
import { useAuthNative } from "@/lib/hooks/use-auth-native";
import { AuthUser, AuthContextType } from "@/lib/types/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  isAuthenticated: false,
  isPrivyConnected: false,
  isNativeConnected: false,
  walletAddress: null,
  logout: async () => {},
  getAccessToken: async () => null,
});

export type { AuthUser, AuthContextType };

/**
 * Auth provider that uses Privy hooks
 * This component MUST be rendered inside PrivyProvider
 */
export function AuthProviderWithPrivy({ children }: { children: ReactNode }) {
  const auth = useAuthPrivy();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Auth provider for native wallet only (no Privy)
 */
export function AuthProviderNative({ children }: { children: ReactNode }) {
  const auth = useAuthNative();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
