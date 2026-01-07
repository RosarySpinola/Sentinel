"use client";

import { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { AptosConfig, Network } from "@aptos-labs/ts-sdk";

interface WalletProviderProps {
  children: ReactNode;
}

// Movement Network configurations
export const MOVEMENT_NETWORKS = {
  mainnet: {
    name: "Movement Mainnet",
    chainId: 126,
    fullnode: "https://mainnet.movementnetwork.xyz/v1",
    explorer: "https://explorer.movementnetwork.xyz",
  },
  testnet: {
    name: "Movement Testnet",
    chainId: 250,
    fullnode: "https://testnet.movementnetwork.xyz/v1",
    explorer: "https://explorer.movementnetwork.xyz/testnet",
  },
} as const;

// Current network - default to testnet for Privy auth
export const CURRENT_NETWORK = "testnet" as keyof typeof MOVEMENT_NETWORKS;

export function WalletProvider({ children }: WalletProviderProps) {
  // Movement network configuration - use MAINNET for wallet adapter compatibility
  const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
    fullnode: MOVEMENT_NETWORKS[CURRENT_NETWORK].fullnode,
  });

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={aptosConfig}
      onError={(error) => {
        console.error("Wallet error:", JSON.stringify(error, null, 2));
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
