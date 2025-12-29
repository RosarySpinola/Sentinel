"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Fuel, Play } from "lucide-react";
import { GasAnalysisRequest } from "../types";

interface GasFormProps {
  onAnalyze: (request: GasAnalysisRequest) => Promise<void>;
  onLoadDemo: () => void;
  isLoading: boolean;
}

export function GasForm({ onAnalyze, onLoadDemo, isLoading }: GasFormProps) {
  const { account, network } = useWallet();

  const [formData, setFormData] = useState({
    network: (network?.chainId === 126 ? "mainnet" : "testnet") as "mainnet" | "testnet",
    sender: "",
    moduleAddress: "0x1",
    moduleName: "aptos_account",
    functionName: "transfer",
  });

  const [typeArgs, setTypeArgs] = useState<string[]>([]);
  const [args, setArgs] = useState<string[]>(['"0x2"', "100"]);

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
      network: formData.network,
      sender: senderAddress,
      moduleAddress: formData.moduleAddress,
      moduleName: formData.moduleName,
      functionName: formData.functionName,
      typeArgs,
      args: parsedArgs,
    });
  };

  const addArg = () => setArgs([...args, ""]);
  const removeArg = (index: number) => setArgs(args.filter((_, i) => i !== index));
  const updateArg = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const addTypeArg = () => setTypeArgs([...typeArgs, ""]);
  const removeTypeArg = (index: number) => setTypeArgs(typeArgs.filter((_, i) => i !== index));
  const updateTypeArg = (index: number, value: string) => {
    const newTypeArgs = [...typeArgs];
    newTypeArgs[index] = value;
    setTypeArgs(newTypeArgs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-primary" />
          Gas Analysis Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Network</Label>
              <Select
                value={formData.network}
                onValueChange={(v) => setFormData({ ...formData, network: v as "mainnet" | "testnet" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sender Address</Label>
              <Input
                placeholder="0x..."
                value={senderAddress}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Module Address</Label>
              <Input
                placeholder="0x1"
                value={formData.moduleAddress}
                onChange={(e) => setFormData({ ...formData, moduleAddress: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Module Name</Label>
              <Input
                placeholder="aptos_account"
                value={formData.moduleName}
                onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Function Name</Label>
              <Input
                placeholder="transfer"
                value={formData.functionName}
                onChange={(e) => setFormData({ ...formData, functionName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Type Arguments</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addTypeArg}>
                <Plus className="h-4 w-4 mr-1" />
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
                <Button type="button" variant="ghost" size="icon" onClick={() => removeTypeArg(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Arguments (JSON format)</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addArg}>
                <Plus className="h-4 w-4 mr-1" />
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
                <Button type="button" variant="ghost" size="icon" onClick={() => removeArg(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isLoading || !senderAddress}>
              <Fuel className="h-4 w-4 mr-2" />
              {isLoading ? "Analyzing..." : "Analyze Gas"}
            </Button>
            <Button type="button" variant="outline" onClick={onLoadDemo} disabled={isLoading}>
              <Play className="h-4 w-4 mr-2" />
              Demo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
