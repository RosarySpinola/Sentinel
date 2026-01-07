"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useApiKeys } from "./hooks/use-api-keys";
import { ApiKeyList } from "./components/api-key-list";
import { CreateApiKeyDialog } from "./components/create-api-key-dialog";

export default function ApiKeysPage() {
  const {
    apiKeys,
    isLoading,
    newKey,
    createKey,
    deleteKey,
    clearNewKey,
    copyToClipboard,
  } = useApiKeys();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-muted mb-6 h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted h-64 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access to Sentinel.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys are used to authenticate requests to the Sentinel API. Keep
            your keys secure and never share them publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyList apiKeys={apiKeys} onDelete={deleteKey} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>How to use your API key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium">Authorization Header</h4>
            <code className="bg-muted block rounded-lg p-3 text-sm">
              Authorization: Bearer stl_live_xxxx...
            </code>
          </div>
          <div>
            <h4 className="mb-2 font-medium">X-API-Key Header</h4>
            <code className="bg-muted block rounded-lg p-3 text-sm">
              X-API-Key: stl_live_xxxx...
            </code>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Example Request</h4>
            <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-sm">
              {`curl -X POST https://api.sentinel.dev/api/v1/simulate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"network": "testnet", ...}'`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <CreateApiKeyDialog
        open={dialogOpen || !!newKey}
        onOpenChange={setDialogOpen}
        onCreate={createKey}
        newKey={newKey}
        onClearNewKey={clearNewKey}
        onCopy={copyToClipboard}
      />
    </div>
  );
}
