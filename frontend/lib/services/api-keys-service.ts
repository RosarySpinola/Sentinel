export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresInDays?: number;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string; // Raw key - shown only once
  keyPrefix: string;
  expiresAt: string | null;
  createdAt: string;
}

export async function listApiKeys(walletAddress: string): Promise<ApiKey[]> {
  const response = await fetch("/api/settings/api-keys", {
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }
  const data = await response.json();
  // Map snake_case API response to camelCase
  return (data.apiKeys || []).map((key: Record<string, unknown>) => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.key_prefix,
    lastUsedAt: key.last_used_at,
    expiresAt: key.expires_at,
    createdAt: key.created_at,
  }));
}

export async function createApiKey(
  request: CreateApiKeyRequest,
  walletAddress: string
): Promise<CreateApiKeyResponse> {
  const response = await fetch("/api/settings/api-keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error("Failed to create API key");
  }
  const data = await response.json();
  // Map snake_case API response to camelCase
  return {
    id: data.id,
    name: data.name,
    key: data.key,
    keyPrefix: data.key_prefix,
    expiresAt: data.expires_at || null,
    createdAt: data.created_at,
  };
}

export async function deleteApiKey(id: string, walletAddress: string): Promise<void> {
  const response = await fetch(`/api/settings/api-keys/${id}`, {
    method: "DELETE",
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete API key");
  }
}
