"use client";

import { useState, useEffect, useCallback } from "react";
import * as apiKeysService from "@/lib/services/api-keys-service";
import type { ApiKey, CreateApiKeyResponse } from "@/lib/services/api-keys-service";
import { toast } from "sonner";

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const keys = await apiKeysService.listApiKeys();
      setApiKeys(keys);
    } catch {
      toast.error("Failed to fetch API keys");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const createKey = async (name: string, expiresInDays?: number) => {
    try {
      const result = await apiKeysService.createApiKey({ name, expiresInDays });
      setNewKey(result);
      setApiKeys((prev) => [
        {
          id: result.id,
          name: result.name,
          keyPrefix: result.keyPrefix,
          lastUsedAt: null,
          expiresAt: result.expiresAt,
          createdAt: result.createdAt,
        },
        ...prev,
      ]);
      toast.success("API key created");
      return result;
    } catch {
      toast.error("Failed to create API key");
      throw new Error("Failed to create API key");
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await apiKeysService.deleteApiKey(id);
      setApiKeys((prev) => prev.filter((key) => key.id !== id));
      toast.success("API key deleted");
    } catch {
      toast.error("Failed to delete API key");
    }
  };

  const clearNewKey = () => {
    setNewKey(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return {
    apiKeys,
    isLoading,
    newKey,
    createKey,
    deleteKey,
    clearNewKey,
    copyToClipboard,
    refresh: fetchApiKeys,
  };
}
