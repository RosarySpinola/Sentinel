"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { usePrivy, useLogout } from "@privy-io/react-auth";
import { AuthUser, AuthContextType } from "@/lib/types/auth";

/**
 * Auth hook for when Privy IS configured
 * This hook can safely call Privy hooks
 */
export function useAuthPrivy(): AuthContextType {
  const { connected, account, disconnect } = useWallet();
  const { ready, authenticated, user } = usePrivy();
  const { logout: privyLogout } = useLogout();

  // Get Privy wallet address if authenticated
  const privyWallet = user?.linkedAccounts?.find(
    (acc: any) => acc.chainType === "aptos"
  ) as any;
  const privyWalletAddress = privyWallet?.address || null;

  // Get the wallet address from Aptos Wallet Adapter
  const nativeWalletAddress = account?.address?.toString() || null;

  // Determine which wallet to use (prioritize Privy if authenticated with wallet)
  const isPrivyConnected = authenticated && !!privyWalletAddress;
  const isNativeConnected = connected && !!nativeWalletAddress;
  const isAuthenticated = isPrivyConnected || isNativeConnected;

  const walletAddress = isPrivyConnected
    ? privyWalletAddress
    : nativeWalletAddress;

  // Get user email from Privy if available
  const userEmail = user?.email?.address || null;

  const authUser: AuthUser | null =
    isAuthenticated && walletAddress
      ? {
          id: walletAddress,
          walletAddress: walletAddress,
          name: null,
          email: userEmail,
          isPrivy: isPrivyConnected,
        }
      : null;

  const handleLogout = async () => {
    if (isPrivyConnected) {
      await privyLogout();
    }
    if (isNativeConnected) {
      disconnect();
    }
  };

  return {
    user: authUser,
    isLoaded: ready,
    isAuthenticated,
    isPrivyConnected,
    isNativeConnected,
    walletAddress,
    logout: handleLogout,
    getAccessToken: async () => walletAddress,
  };
}
