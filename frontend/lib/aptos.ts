import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Movement network configurations
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
