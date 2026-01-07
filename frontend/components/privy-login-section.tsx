"use client";

import { useState, useEffect } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { Button } from "@/components/ui/button";
import { createMovementWallet } from "@/lib/privy-movement";

interface PrivyLoginSectionProps {
  onClose: () => void;
}

export default function PrivyLoginSection({ onClose }: PrivyLoginSectionProps) {
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const { authenticated, user } = usePrivy();
  const { createWallet } = useCreateWallet();

  // Check for Movement wallet (check chainType only, like Velox)
  const movementWallet: any = user?.linkedAccounts?.find(
    (account: any) => account.chainType === "aptos"
  );

  // Auto-close dialog when wallet is connected
  useEffect(() => {
    if (authenticated && movementWallet) {
      onClose();
    }
  }, [authenticated, movementWallet, onClose]);

  const handleWalletCreation = async (userToUse: any) => {
    try {
      setIsCreatingWallet(true);
      const wallet = await createMovementWallet(userToUse, createWallet);
      onClose();
      return wallet;
    } catch (error) {
      console.error("Wallet creation error:", error);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const { login } = useLogin({
    onComplete: async ({ user: completedUser }) => {
      try {
        await handleWalletCreation(completedUser);
      } catch (error) {
        console.error("Error in login completion:", error);
        setIsCreatingWallet(false);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setIsCreatingWallet(false);
    },
  });

  const handlePrivyLogin = async () => {
    try {
      setIsCreatingWallet(true);

      if (!authenticated) {
        await login({
          loginMethods: ["email", "twitter", "google", "github", "discord"],
          prefill: { type: "email", value: "" },
          disableSignup: false,
        });
      } else {
        await handleWalletCreation(user);
      }
    } catch (error) {
      console.error("Privy login error:", error);
      setIsCreatingWallet(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-bold">Login with Privy</h3>
        <p className="text-muted-foreground text-sm">
          Secure social login with automatic wallet creation
        </p>
      </div>

      <Button
        variant="default"
        className="h-12 w-full justify-center font-medium"
        onClick={handlePrivyLogin}
        disabled={isCreatingWallet || (authenticated && !!movementWallet)}
      >
        {isCreatingWallet ? (
          <div className="flex items-center space-x-2">
            <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-b-2"></div>
            <span>Setting up wallet...</span>
          </div>
        ) : authenticated && movementWallet ? (
          <span>Wallet Connected</span>
        ) : authenticated ? (
          <span>Create Movement Wallet</span>
        ) : (
          <span>Continue with Privy</span>
        )}
      </Button>

      {authenticated && user && (
        <div className="space-y-2">
          <div className="text-muted-foreground bg-muted/50 rounded-lg p-3 text-center text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-600"></div>
              <span>
                Authenticated as:{" "}
                {user.email?.address || user.phone?.number || "User"}
              </span>
            </div>
          </div>

          {movementWallet ? (
            <div className="bg-muted border-border rounded-lg border p-3 text-center text-sm">
              <div className="mb-1 flex items-center justify-center space-x-2">
                <div className="bg-primary h-2 w-2 rounded-full"></div>
                <span className="text-foreground font-medium">
                  Movement Wallet Connected
                </span>
              </div>
              <div className="text-muted-foreground font-mono text-xs">
                {movementWallet.address?.slice(0, 6)}...
                {movementWallet.address?.slice(-4)}
              </div>
            </div>
          ) : (
            <div className="bg-muted border-border rounded-lg border p-3 text-center text-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
                <span className="text-muted-foreground">
                  Movement Wallet Not Created
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
