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

export async function listApiKeys(): Promise<ApiKey[]> {
  const response = await fetch("/api/settings/api-keys");
  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }
  const data = await response.json();
  return data.apiKeys || [];
}

export async function createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
  const response = await fetch("/api/settings/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error("Failed to create API key");
  }
  return response.json();
}

export async function deleteApiKey(id: string): Promise<void> {
  const response = await fetch(`/api/settings/api-keys/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete API key");
  }
}
