"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { SendTransaction } from "@/components/send-transaction";
import { SignMessage } from "@/components/sign-message";
import { SwitchNetwork } from "@/components/switch-network";

export function WalletDemoContent() {
  const { account, disconnect, network } = useWallet();

  const address = account?.address?.toString() || "";

  // Parse network from useWallet based on chain ID
  const getNetworkName = () => {
    if (!network?.chainId) return "Unknown Network";

    switch (network.chainId) {
      case 126:
        return "Movement Mainnet";
      case 250:
        return "Movement Testnet";
      default:
        return "Unknown Network";
    }
  };

  const networkConfig = {
    name: getNetworkName(),
    chainId: network?.chainId || 0,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-foreground text-3xl font-bold">Wallet Connected</h1>
        <Button variant="outline" onClick={disconnect}>
          Disconnect Wallet
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Network Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Connected Address
              </p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Current Network
              </p>
              <p className="text-sm">
                {networkConfig.name} (Chain ID: {networkConfig.chainId})
              </p>
            </div>
          </CardContent>
        </Card>

        <SwitchNetwork />

        <SignMessage />

        <SendTransaction />
      </div>
    </div>
  );
}
