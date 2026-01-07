"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AuthUser, AuthContextType } from "@/lib/types/auth";

/**
 * Auth hook for when Privy is NOT configured
 * Only uses native Aptos wallet adapter
 */
export function useAuthNative(): AuthContextType {
  const { connected, account, disconnect } = useWallet();

  const walletAddress = account?.address?.toString() || null;
  const isAuthenticated = connected && !!walletAddress;

  const authUser: AuthUser | null =
    isAuthenticated && walletAddress
      ? {
          id: walletAddress,
          walletAddress: walletAddress,
          name: null,
          email: null,
          isPrivy: false,
        }
      : null;

  return {
    user: authUser,
    isLoaded: true,
    isAuthenticated,
    isPrivyConnected: false,
    isNativeConnected: isAuthenticated,
    walletAddress,
    logout: disconnect,
    getAccessToken: async () => walletAddress,
  };
}
