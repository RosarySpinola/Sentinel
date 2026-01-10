"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Zap } from "lucide-react";
import { SimulationRequest } from "../types";
import { useNetwork } from "@/lib/contexts/network-context";

interface SimulationFormProps {
  onSimulate: (request: SimulationRequest) => Promise<void>;
  isLoading: boolean;
}

export function SimulationForm({ onSimulate, isLoading }: SimulationFormProps) {
  const { account } = useWallet();
  const { network } = useNetwork();

  // Demo: Batch transfer to multiple recipients - shows vectors, multi-state changes
  const [formData, setFormData] = useState({
    sender: "0x1",
    moduleAddress: "0x1",
    moduleName: "aptos_account",
    functionName: "batch_transfer",
    maxGas: 500000,
  });

  const [isView, setIsView] = useState(false); // Entry function for impressive demo

  const [typeArgs, setTypeArgs] = useState<string[]>([]);
  const [args, setArgs] = useState<string[]>([
    '["0x2", "0x3", "0x4", "0x5"]',
    '[100000000, 200000000, 300000000, 400000000]'
  ]); // Batch transfer: 4 recipients with 1-4 MOVE each

  // Auto-fill sender when wallet connects
  const senderAddress = formData.sender || account?.address?.toString() || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse arguments from strings to proper types
    const parsedArgs = args.map((arg) => {
      try {
        return JSON.parse(arg);
      } catch {
        return arg;
      }
    });

    await onSimulate({
      network,
      sender: senderAddress,
      moduleAddress: formData.moduleAddress,
      moduleName: formData.moduleName,
      functionName: formData.functionName,
      typeArgs,
      args: parsedArgs,
      maxGas: formData.maxGas,
      isView,
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
          <Zap className="text-primary h-5 w-5" />
          Simulation Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sender */}
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

          {/* Module Address */}
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

          {/* Module Name */}
          <div className="space-y-2">
            <Label>Module Name</Label>
            <Input
              placeholder="aptos_account"
              value={formData.moduleName}
              onChange={(e) =>
                setFormData({ ...formData, moduleName: e.target.value })
              }
            />
          </div>

          {/* Function Name */}
          <div className="space-y-2">
            <Label>Function Name</Label>
            <Input
              placeholder="transfer"
              value={formData.functionName}
              onChange={(e) =>
                setFormData({ ...formData, functionName: e.target.value })
              }
            />
          </div>

          {/* Type Arguments */}
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

          {/* Arguments */}
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

          {/* Is View Function Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>View Function</Label>
              <p className="text-muted-foreground text-xs">
                Enable for read-only functions (no signature required)
              </p>
            </div>
            <Switch
              checked={isView}
              onCheckedChange={setIsView}
            />
          </div>

          {/* Max Gas - only show for entry functions */}
          {!isView && (
            <div className="space-y-2">
              <Label>Max Gas</Label>
              <Input
                type="number"
                value={formData.maxGas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxGas: parseInt(e.target.value) || 100000,
                  })
                }
              />
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !senderAddress}
          >
            {isLoading ? "Simulating..." : "Simulate Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
