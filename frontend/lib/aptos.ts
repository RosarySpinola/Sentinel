import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Movement network configurations with Shinami and public fallbacks
export const MOVEMENT_CONFIGS = {
  mainnet: {
    chainId: 126,
    name: "Movement Mainnet",
    fullnode: "https://mainnet.movementnetwork.xyz/v1",
    explorer: "https://explorer.movementnetwork.xyz",
  },
  testnet: {
    chainId: 250,
    name: "Movement Testnet",
    fullnode: "https://testnet.movementnetwork.xyz/v1",
    explorer: "https://explorer.movementnetwork.xyz/testnet",
  },
} as const;

// Current network (change this to switch between networks)
export const CURRENT_NETWORK = "testnet" as keyof typeof MOVEMENT_CONFIGS;

// Initialize Aptos SDK with current Movement network
// Note: For Shinami-backed calls, use the /api/rpc proxy instead
export const aptos = new Aptos(
  new AptosConfig({
    network: Network.CUSTOM,
    fullnode: MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode,
  })
);

// Get explorer URL for a transaction or account
export const getExplorerUrl = (
  type: "txn" | "account",
  hashOrAddress: string
): string => {
  const base = MOVEMENT_CONFIGS[CURRENT_NETWORK].explorer;
  return `${base}/${type}/${hashOrAddress}`;
};

/**
 * Fetch account resource via Shinami-backed RPC proxy
 * Use this for reliable, rate-limit-free account queries
 */
export async function getAccountResource(
  address: string,
  resourceType: string,
  network: keyof typeof MOVEMENT_CONFIGS = CURRENT_NETWORK
): Promise<unknown> {
  const path = `accounts/${address}/resource/${encodeURIComponent(resourceType)}`;
  const response = await fetch(`/api/rpc?network=${network}&path=${path}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to fetch resource: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch account info via Shinami-backed RPC proxy
 */
export async function getAccountInfo(
  address: string,
  network: keyof typeof MOVEMENT_CONFIGS = CURRENT_NETWORK
): Promise<{ sequence_number: string; authentication_key: string }> {
  const path = `accounts/${address}`;
  const response = await fetch(`/api/rpc?network=${network}&path=${path}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to fetch account: ${response.status}`);
  }

  return response.json();
}
