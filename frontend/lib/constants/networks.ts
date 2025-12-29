export const MOVEMENT_NETWORKS = {
  mainnet: {
    chainId: 126,
    name: "Movement Mainnet",
    rpc: "https://mainnet.movementnetwork.xyz/v1",
    explorer: "https://explorer.movementnetwork.xyz",
    explorerParam: "mainnet",
  },
  testnet: {
    chainId: 250,
    name: "Movement Testnet",
    rpc: "https://testnet.movementnetwork.xyz/v1",
    explorer: "https://explorer.movementnetwork.xyz",
    explorerParam: "testnet",
  },
} as const;

export type NetworkType = keyof typeof MOVEMENT_NETWORKS;

export function getNetworkByChainId(chainId: number | undefined) {
  if (chainId === 126) return MOVEMENT_NETWORKS.mainnet;
  if (chainId === 250) return MOVEMENT_NETWORKS.testnet;
  return MOVEMENT_NETWORKS.testnet; // Default to testnet
}

export function getExplorerUrl(txHash: string, network: NetworkType = "testnet") {
  const config = MOVEMENT_NETWORKS[network];
  return `${config.explorer}/txn/${txHash}?network=${config.explorerParam}`;
}
