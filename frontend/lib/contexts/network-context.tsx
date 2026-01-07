"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { NetworkType, MOVEMENT_NETWORKS } from "@/lib/constants/networks";

interface NetworkContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  networkConfig: (typeof MOVEMENT_NETWORKS)[NetworkType];
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const STORAGE_KEY = "sentinel-network";

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<NetworkType>("testnet");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "mainnet" || stored === "testnet")) {
      setNetworkState(stored);
    }
  }, []);

  const setNetwork = (newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    localStorage.setItem(STORAGE_KEY, newNetwork);
  };

  const networkConfig = MOVEMENT_NETWORKS[network];

  return (
    <NetworkContext.Provider value={{ network, setNetwork, networkConfig }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
