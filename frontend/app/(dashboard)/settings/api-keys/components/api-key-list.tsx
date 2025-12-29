"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Key } from "lucide-react";
import type { ApiKey } from "@/lib/services/api-keys-service";
import { formatDistanceToNow } from "@/lib/utils/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDelete: (id: string) => void;
}

export function ApiKeyList({ apiKeys, onDelete }: ApiKeyListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (apiKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Key className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No API keys yet</h2>
        <p className="text-muted-foreground">
          Create an API key to access the Sentinel API programmatically.
        </p>
      </div>
    );
  }

  const getExpirationStatus = (expiresAt: string | null) => {
    if (!expiresAt) {
      return <Badge variant="outline">Never expires</Badge>;
    }
    const expDate = new Date(expiresAt);
    const now = new Date();
    if (expDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <span className="text-muted-foreground">{formatDistanceToNow(expDate)}</span>;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <code className="text-sm bg-muted px-2 py-1 rounded">{key.keyPrefix}</code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(key.createdAt))}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {key.lastUsedAt ? formatDistanceToNow(new Date(key.lastUsedAt)) : "Never"}
              </TableCell>
              <TableCell>{getExpirationStatus(key.expiresAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(key.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? Any applications using this key
              will no longer be able to authenticate. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
