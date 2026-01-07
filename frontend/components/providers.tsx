"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "@/components/wallet-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import {
  AuthProviderWithPrivy,
  AuthProviderNative,
} from "@/components/auth-provider";
import { ApiKeyProvider } from "@/lib/contexts/api-key-context";
import { createContext, useContext, ReactNode } from "react";

// Get Privy App ID from environment
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const isPrivyConfigured = !!(
  PRIVY_APP_ID && PRIVY_APP_ID !== "YOUR_PRIVY_APP_ID"
);

// Context to track if Privy is available
const PrivyAvailableContext = createContext<boolean>(false);
export const usePrivyAvailable = () => useContext(PrivyAvailableContext);

export function Providers({ children }: { children: ReactNode }) {
  // If no Privy App ID is configured, render without PrivyProvider
  if (!isPrivyConfigured) {
    return (
      <PrivyAvailableContext.Provider value={false}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <AuthProviderNative>
              <ApiKeyProvider>
                {children}
                <Toaster />
              </ApiKeyProvider>
            </AuthProviderNative>
          </WalletProvider>
        </ThemeProvider>
      </PrivyAvailableContext.Provider>
    );
  }

  return (
    <PrivyAvailableContext.Provider value={true}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <WalletProvider>
          <PrivyProvider
            appId={PRIVY_APP_ID!}
            config={{
              loginMethods: ["email", "google", "twitter", "discord", "github"],
            }}
          >
            <AuthProviderWithPrivy>
              <ApiKeyProvider>
                {children}
                <Toaster />
              </ApiKeyProvider>
            </AuthProviderWithPrivy>
          </PrivyProvider>
        </WalletProvider>
      </ThemeProvider>
    </PrivyAvailableContext.Provider>
  );
}
