"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Fuel, Wallet } from "lucide-react";
import { GasAnalysisRequest } from "../types";
import { useNetwork } from "@/lib/contexts/network-context";
import { useAuth } from "@/lib/hooks/use-auth";

interface GasFormProps {
  onAnalyze: (request: GasAnalysisRequest) => Promise<void>;
  isLoading: boolean;
}

export function GasForm({ onAnalyze, isLoading }: GasFormProps) {
  const { isAuthenticated, walletAddress } = useAuth();
  const { network } = useNetwork();

  // Demo: Large batch transfer - impressive gas profiling across 10 recipients
  // Shows O(n) gas scaling, vector processing, and real DeFi airdrop use case
  const [formData, setFormData] = useState({
    sender: "", // Will use connected wallet address
    moduleAddress: "0x1",
    moduleName: "aptos_account",
    functionName: "batch_transfer",
  });

  const [typeArgs, setTypeArgs] = useState<string[]>([]);
  // 10 recipients with varying amounts - simulates airdrop or payroll distribution
  const [args, setArgs] = useState<string[]>([
    '["0x2", "0x3", "0x4", "0x5", "0x6", "0x7", "0x8", "0x9", "0xa", "0xb"]',
    '["50000000", "75000000", "100000000", "125000000", "150000000", "175000000", "200000000", "225000000", "250000000", "500000000"]'
  ]); // 10 recipients: 0.5 to 5 MOVE each (total: 18.5 MOVE)

  // Auto-update sender when wallet connects
  const senderAddress = walletAddress || formData.sender;

  // Keep batch_transfer args when wallet connects
  useEffect(() => {
    if (walletAddress) {
      // Batch transfer to 10 recipients with varying amounts (simulates airdrop)
      setArgs([
        '["0x2", "0x3", "0x4", "0x5", "0x6", "0x7", "0x8", "0x9", "0xa", "0xb"]',
        '["50000000", "75000000", "100000000", "125000000", "150000000", "175000000", "200000000", "225000000", "250000000", "500000000"]'
      ]);
    }
  }, [walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedArgs = args.map((arg) => {
      try {
        return JSON.parse(arg);
      } catch {
        return arg;
      }
    });

    await onAnalyze({
      network,
      sender: senderAddress,
      moduleAddress: formData.moduleAddress,
      moduleName: formData.moduleName,
      functionName: formData.functionName,
      typeArgs,
      args: parsedArgs,
    });
  };

  const addArg = () => setArgs([...args, ""]);
  const removeArg = (index: number) =>
    setArgs(args.filter((_, i) => i !== index));
  const updateArg = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const addTypeArg = () => setTypeArgs([...typeArgs, ""]);
  const removeTypeArg = (index: number) =>
    setTypeArgs(typeArgs.filter((_, i) => i !== index));
  const updateTypeArg = (index: number, value: string) => {
    const newTypeArgs = [...typeArgs];
    newTypeArgs[index] = value;
    setTypeArgs(newTypeArgs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="text-primary h-5 w-5" />
          Gas Analysis Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Sender Address</Label>
            <Input
              placeholder="0x..."
              value={senderAddress}
              onChange={(e) =>
                setFormData({ ...formData, sender: e.target.value })
              }
              className="font-mono text-sm"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Module Address</Label>
              <Input
                placeholder="0x1"
                value={formData.moduleAddress}
                onChange={(e) =>
                  setFormData({ ...formData, moduleAddress: e.target.value })
                }
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Module Name</Label>
              <Input
                placeholder="coin"
                value={formData.moduleName}
                onChange={(e) =>
                  setFormData({ ...formData, moduleName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Function Name</Label>
              <Input
                placeholder="balance"
                value={formData.functionName}
                onChange={(e) =>
                  setFormData({ ...formData, functionName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Type Arguments</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addTypeArg}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {typeArgs.map((arg, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
                  value={arg}
                  onChange={(e) => updateTypeArg(i, e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTypeArg(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Arguments (JSON format)</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addArg}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {args.map((arg, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder='"value" or 123'
                  value={arg}
                  onChange={(e) => updateArg(i, e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArg(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {!isAuthenticated && (
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Connect your wallet to analyze gas. Your public key is required for transaction simulation.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isAuthenticated}
          >
            <Fuel className="mr-2 h-4 w-4" />
            {isLoading ? "Analyzing..." : "Analyze Gas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
