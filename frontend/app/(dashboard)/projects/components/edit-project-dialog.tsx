"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, UpdateProjectInput, NetworkType } from "@/lib/types/project";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, input: UpdateProjectInput) => Promise<void>;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onSubmit,
}: EditProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [network, setNetwork] = useState<NetworkType>("testnet");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setNetwork(project.network);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !name.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        network,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-network">Default Network</Label>
            <Select value={network} onValueChange={(v) => setNetwork(v as NetworkType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mainnet">Mainnet</SelectItem>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="devnet">Devnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
