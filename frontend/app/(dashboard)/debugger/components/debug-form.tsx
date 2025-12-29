"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Bug, Loader2 } from "lucide-react";
import type { TraceRequest } from "../types";

interface DebugFormProps {
  onSubmit: (request: TraceRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function DebugForm({ onSubmit, isLoading, error }: DebugFormProps) {
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet");
  const [sender, setSender] = useState("");
  const [moduleAddress, setModuleAddress] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [typeArgs, setTypeArgs] = useState("");
  const [args, setArgs] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const request: TraceRequest = {
      network,
      sender: sender || moduleAddress,
      moduleAddress,
      moduleName,
      functionName,
      typeArgs: typeArgs ? typeArgs.split(",").map((t) => t.trim()) : [],
      args: args ? JSON.parse(`[${args}]`) : [],
    };

    await onSubmit(request);
  };

  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bug className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Start Debug Session</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Enter transaction parameters to trace execution step-by-step
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <div className="space-y-2">
            <Label>Network</Label>
            <Select
              value={network}
              onValueChange={(v) => setNetwork(v as "mainnet" | "testnet")}
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
            <Label>Module Address</Label>
            <Input
              placeholder="0x1"
              value={moduleAddress}
              onChange={(e) => setModuleAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Module Name</Label>
              <Input
                placeholder="coin"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Function Name</Label>
              <Input
                placeholder="transfer"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sender Address (optional)</Label>
            <Input
              placeholder="Defaults to module address"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Type Arguments (comma-separated)</Label>
            <Input
              placeholder="0x1::aptos_coin::AptosCoin"
              value={typeArgs}
              onChange={(e) => setTypeArgs(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Arguments (JSON values, comma-separated)</Label>
            <Input
              placeholder='"0x123", 1000'
              value={args}
              onChange={(e) => setArgs(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Trace...
              </>
            ) : (
              "Start Debug Session"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
