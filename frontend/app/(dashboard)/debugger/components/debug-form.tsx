"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bug, Loader2 } from "lucide-react";
import type { TraceRequest } from "../types";
import { useNetwork } from "@/lib/contexts/network-context";

interface DebugFormProps {
  onSubmit: (request: TraceRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function DebugForm({ onSubmit, isLoading, error }: DebugFormProps) {
  const { network } = useNetwork();
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
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Bug className="text-primary h-8 w-8" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">Start Debug Session</h3>
          <p className="text-muted-foreground max-w-md text-center text-sm">
            Enter transaction parameters to trace execution step-by-step
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4">
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
            <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
