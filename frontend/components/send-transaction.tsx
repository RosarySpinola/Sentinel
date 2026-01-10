"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Aptos,
  AptosConfig,
  Network,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
} from "@aptos-labs/ts-sdk";
import { toast } from "sonner";
import { isSponsorshipEnabled, sponsorAndSubmitTransaction } from "@/lib/shinami";

// Convert wallet's {0: byte, 1: byte, ...} object to Uint8Array
const toBytes = (obj: Record<string, number>) =>
  new Uint8Array(Object.keys(obj).map(Number).sort((a, b) => a - b).map(k => obj[k]));

export function SendTransaction() {
  const { account, signAndSubmitTransaction, signTransaction, network } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gaslessEnabled, setGaslessEnabled] = useState(false);
  const [sponsorshipAvailable, setSponsorshipAvailable] = useState(false);

  // Check if sponsorship is available
  useEffect(() => {
    isSponsorshipEnabled().then(setSponsorshipAvailable);
  }, []);

  // Movement network configurations
  const MOVEMENT_CONFIGS = {
    mainnet: {
      chainId: 126,
      name: "Movement Mainnet",
      fullnode: "https://mainnet.movementnetwork.xyz/v1",
      explorer: "mainnet",
    },
    testnet: {
      chainId: 250,
      name: "Movement Testnet",
      fullnode: "https://testnet.movementnetwork.xyz/v1",
      explorer: "testnet",
    },
  };

  const getCurrentNetworkConfig = () => {
    if (network?.chainId === 126) {
      return MOVEMENT_CONFIGS.mainnet;
    } else if (network?.chainId === 250) {
      return MOVEMENT_CONFIGS.testnet;
    }
    return MOVEMENT_CONFIGS.testnet;
  };

  const getAptosClient = () => {
    const networkConfig = getCurrentNetworkConfig();
    const config = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: networkConfig.fullnode,
    });
    return new Aptos(config);
  };

  const getExplorerUrl = (txHash: string) => {
    const networkConfig = getCurrentNetworkConfig();
    return `https://explorer.movementnetwork.xyz/txn/${txHash}?network=${networkConfig.explorer}`;
  };

  const handleSendTransaction = async () => {
    if (!account) {
      toast.error("No account connected");
      return;
    }

    if (!recipient) {
      toast.error("Please enter a recipient address");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Preparing transaction...");

    try {
      const amountInOctas = 100000000; // 1 MOVE
      const aptos = getAptosClient();

      if (gaslessEnabled && sponsorshipAvailable) {
        // Gasless flow using Shinami
        toast.loading("Building gasless transaction...", { id: loadingToast });

        const tx = await aptos.transaction.build.simple({
          sender: account.address,
          data: {
            function: "0x1::aptos_account::transfer",
            functionArguments: [recipient, amountInOctas],
          },
          withFeePayer: true, // Enable gas sponsorship
        });

        toast.loading("Waiting for wallet signature...", { id: loadingToast });

        const signed = await signTransaction({ transactionOrPayload: tx });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const auth = signed.authenticator as any;
        const pubKeyBytes = toBytes(auth.public_key.key.data);
        const sigBytes = toBytes(auth.signature.data.data);
        const authenticator = new AccountAuthenticatorEd25519(
          new Ed25519PublicKey(pubKeyBytes),
          new Ed25519Signature(sigBytes)
        );

        toast.loading("Sponsoring and submitting transaction...", { id: loadingToast });

        const result = await sponsorAndSubmitTransaction(tx, authenticator);

        if (!result.success || !result.hash) {
          throw new Error(result.error || "Sponsored submission failed");
        }

        toast.loading("Waiting for confirmation...", { id: loadingToast });

        const executed = await aptos.waitForTransaction({ transactionHash: result.hash });

        if (executed.success) {
          toast.success(
            <div className="flex flex-col gap-2">
              <p>Gasless transaction confirmed!</p>
              <a
                href={getExplorerUrl(result.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline hover:no-underline"
              >
                View on Explorer
              </a>
            </div>,
            { id: loadingToast, duration: 10000 }
          );
        } else {
          throw new Error("Transaction failed on-chain");
        }
      } else {
        // Standard flow (user pays gas)
        toast.loading("Waiting for wallet approval...", { id: loadingToast });

        const response = await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: "0x1::aptos_account::transfer",
            functionArguments: [recipient, amountInOctas],
          },
        });

        toast.loading("Transaction submitted. Waiting for confirmation...", { id: loadingToast });

        try {
          await aptos.waitForTransaction({ transactionHash: response.hash });

          toast.success(
            <div className="flex flex-col gap-2">
              <p>Transaction confirmed!</p>
              <a
                href={getExplorerUrl(response.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline hover:no-underline"
              >
                View on Explorer
              </a>
            </div>,
            { id: loadingToast, duration: 10000 }
          );
        } catch {
          toast.warning("Transaction submitted but confirmation timed out", {
            id: loadingToast,
            description: "Check the explorer for status",
            action: {
              label: "View",
              onClick: () => window.open(getExplorerUrl(response.hash), "_blank"),
            },
          });
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send transaction";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Send 1 MOVE token to another address.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium">Recipient Address</label>
          <Input
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {sponsorshipAvailable && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Gasless Transaction</Label>
              <p className="text-muted-foreground text-xs">
                Transaction fees paid by sponsor
              </p>
            </div>
            <Switch
              checked={gaslessEnabled}
              onCheckedChange={setGaslessEnabled}
              disabled={isLoading}
            />
          </div>
        )}

        <Button
          onClick={handleSendTransaction}
          disabled={isLoading || !account}
          className="w-full"
        >
          {isLoading
            ? "Sending..."
            : gaslessEnabled && sponsorshipAvailable
            ? "Send 1 MOVE (Gasless)"
            : "Send 1 MOVE"}
        </Button>
      </CardContent>
    </Card>
  );
}
