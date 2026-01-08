"use client";

import { useState, useEffect, useCallback } from "react";
import { getAccountResource } from "@/lib/aptos";

interface UseMoveBalanceReturn {
  balance: bigint;
  formatted: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch MOVE token balance using Shinami-backed RPC proxy
 * Provides better reliability and rate limits than direct RPC calls
 */
export function useMoveBalance(
  address: string | null | undefined
): UseMoveBalanceReturn {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the Shinami-backed RPC proxy for reliable balance queries
      const resources = await getAccountResource(
        address,
        "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );

      const coinBalance = BigInt((resources as { coin: { value: string } }).coin.value);
      setBalance(coinBalance);
    } catch (err) {
      const errorMsg = (err as Error)?.message || "";
      // Account might not have MOVE yet or resource doesn't exist
      if (errorMsg.includes("Resource not found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("not found")) {
        setBalance(BigInt(0));
      } else if (
        errorMsg.includes("401") ||
        errorMsg.includes("403") ||
        errorMsg.includes("500") ||
        errorMsg.includes("502") ||
        errorMsg.includes("RPC")
      ) {
        // Auth/Network/RPC errors - set balance to 0 but log for debugging
        console.warn("RPC error fetching MOVE balance:", err);
        setBalance(BigInt(0));
      } else {
        setError(err as Error);
        console.error("Error fetching MOVE balance:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Format balance with 8 decimals (MOVE has 8 decimals)
  const formatted = (Number(balance) / 1e8).toFixed(4);

  return {
    balance,
    formatted,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
