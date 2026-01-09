"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Fuel } from "lucide-react";
import { GasAnalysisRequest } from "../types";
import { useNetwork } from "@/lib/contexts/network-context";

interface GasFormProps {
  onAnalyze: (request: GasAnalysisRequest) => Promise<void>;
  isLoading: boolean;
}

export function GasForm({ onAnalyze, isLoading }: GasFormProps) {
  const { account } = useWallet();
  const { network } = useNetwork();

  // Pre-filled with coin::balance view function - works without funds
  const [formData, setFormData] = useState({
    sender: "0x1",
    moduleAddress: "0x1",
    moduleName: "coin",
    functionName: "balance",
  });

  const [typeArgs, setTypeArgs] = useState<string[]>(["0x1::aptos_coin::AptosCoin"]);
  const [args, setArgs] = useState<string[]>(['"0x1"']);

  const senderAddress = formData.sender || account?.address?.toString() || "";

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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !senderAddress}
          >
            <Fuel className="mr-2 h-4 w-4" />
            {isLoading ? "Analyzing..." : "Analyze Gas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
