"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Copy, AlertTriangle, Check } from "lucide-react";
import type { CreateApiKeyResponse } from "@/lib/services/api-keys-service";

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, expiresInDays?: number) => Promise<CreateApiKeyResponse>;
  newKey: CreateApiKeyResponse | null;
  onClearNewKey: () => void;
  onCopy: (text: string) => void;
}

const EXPIRATION_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
  { value: "never", label: "Never" },
];

export function CreateApiKeyDialog({
  open,
  onOpenChange,
  onCreate,
  newKey,
  onClearNewKey,
  onCopy,
}: CreateApiKeyDialogProps) {
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("90");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const expiresInDays = expiration === "never" ? undefined : parseInt(expiration);
      await onCreate(name.trim(), expiresInDays);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (newKey) {
      onCopy(newKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setExpiration("90");
    setCopied(false);
    onClearNewKey();
    onOpenChange(false);
  };

  // Show the generated key
  if (newKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-500">
                Make sure to copy your API key now. This is the only time you'll see it.
              </p>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <code className="flex-1 p-3 bg-muted rounded-lg text-sm break-all font-mono">
                  {newKey.key}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for programmatic access to Sentinel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My API Key"
              required
            />
            <p className="text-sm text-muted-foreground">
              A name to help you identify this key.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration</Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
