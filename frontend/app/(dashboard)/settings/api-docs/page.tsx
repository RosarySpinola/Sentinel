"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EndpointProps {
  method: "POST" | "GET";
  path: string;
  description: string;
  requestBody?: object;
  responseBody?: object;
  headers?: { name: string; required: boolean; description: string }[];
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: EndpointProps }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge
            variant={endpoint.method === "POST" ? "default" : "secondary"}
            className={
              endpoint.method === "POST"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }
          >
            {endpoint.method}
          </Badge>
          <code className="text-lg font-mono">{endpoint.path}</code>
        </div>
        <p className="text-muted-foreground mt-2">{endpoint.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoint.headers && (
          <div>
            <h4 className="font-semibold mb-2">Headers</h4>
            <div className="bg-muted rounded-lg p-4">
              {endpoint.headers.map((header) => (
                <div
                  key={header.name}
                  className="flex items-center gap-2 mb-2 last:mb-0"
                >
                  <code className="text-sm font-mono text-primary">
                    {header.name}
                  </code>
                  {header.required && (
                    <Badge variant="outline" className="text-xs">
                      required
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-sm">
                    - {header.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {endpoint.requestBody && (
          <div>
            <h4 className="font-semibold mb-2">Request Body</h4>
            <CodeBlock
              code={JSON.stringify(endpoint.requestBody, null, 2)}
              language="json"
            />
          </div>
        )}

        {endpoint.responseBody && (
          <div>
            <h4 className="font-semibold mb-2">Response</h4>
            <CodeBlock
              code={JSON.stringify(endpoint.responseBody, null, 2)}
              language="json"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const endpoints: Record<string, EndpointProps[]> = {
  simulation: [
    {
      method: "POST",
      path: "/api/simulate",
      description:
        "Simulate a Move transaction without submitting it to the blockchain. Returns execution results, gas usage, and state changes.",
      headers: [
        {
          name: "Content-Type",
          required: true,
          description: "application/json",
        },
        {
          name: "X-API-Key",
          required: true,
          description: "Your Sentinel API key",
        },
      ],
      requestBody: {
        network: "testnet",
        sender: "0x1",
        module_address: "0x1",
        module_name: "coin",
        function_name: "transfer",
        type_args: ["0x1::aptos_coin::AptosCoin"],
        args: ["0x2", "1000000"],
      },
      responseBody: {
        success: true,
        gas_used: 1234,
        vm_status: "Executed successfully",
        events: [],
        changes: [],
      },
    },
  ],
  debugger: [
    {
      method: "POST",
      path: "/api/trace",
      description:
        "Step-by-step execution trace of a Move transaction. Returns detailed execution steps, gas per operation, and stack traces.",
      headers: [
        {
          name: "Content-Type",
          required: true,
          description: "application/json",
        },
        {
          name: "X-API-Key",
          required: true,
          description: "Your Sentinel API key",
        },
      ],
      requestBody: {
        network: "testnet",
        sender: "0x1",
        module_address: "0x1",
        module_name: "coin",
        function_name: "balance",
        type_args: ["0x1::aptos_coin::AptosCoin"],
        args: ["0x1"],
      },
      responseBody: {
        steps: [
          {
            pc: 0,
            instruction: "Call",
            gas_used: 10,
            stack: [],
            locals: {},
          },
        ],
        total_gas: 160,
        total_steps: 3,
      },
    },
  ],
  prover: [
    {
      method: "POST",
      path: "/api/prove",
      description:
        "Run the Move Prover for formal verification of Move smart contracts. Verifies spec blocks and invariants.",
      headers: [
        {
          name: "Content-Type",
          required: true,
          description: "application/json",
        },
        {
          name: "X-API-Key",
          required: true,
          description: "Your Sentinel API key",
        },
      ],
      requestBody: {
        move_code:
          "module 0x1::example {\n  spec module {\n    invariant forall a: u64: a >= 0;\n  }\n}",
        module_name: "example",
        specs: [],
        timeout_seconds: 120,
      },
      responseBody: {
        status: "passed",
        duration_ms: 1505,
        modules: [
          {
            name: "example",
            status: "passed",
            specs: [],
          },
        ],
        summary: "All specifications verified successfully",
      },
    },
  ],
  gas: [
    {
      method: "POST",
      path: "/api/analyze-gas",
      description:
        "Analyze gas usage breakdown for a Move transaction. Identifies expensive operations and provides optimization suggestions.",
      headers: [
        {
          name: "Content-Type",
          required: true,
          description: "application/json",
        },
        {
          name: "X-API-Key",
          required: true,
          description: "Your Sentinel API key",
        },
      ],
      requestBody: {
        network: "testnet",
        sender: "0x1",
        module_address: "0x1",
        module_name: "coin",
        function_name: "transfer",
        type_args: ["0x1::aptos_coin::AptosCoin"],
        args: ["0x2", "1000000"],
        max_gas: 100000,
      },
      responseBody: {
        total_gas: 1234,
        breakdown: [
          {
            operation: "storage_read",
            function_name: "coin::balance",
            gas: 500,
            percentage: 40.5,
          },
        ],
        suggestions: [
          "Consider batching multiple reads into a single operation",
        ],
      },
    },
  ],
};

export default function ApiDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          REST API reference for integrating Sentinel with your applications
        </p>
      </div>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code="https://sentinel-debugger.vercel.app/api"
            language="text"
          />
          <p className="text-muted-foreground text-sm mt-2">
            For local development, use{" "}
            <code className="bg-muted px-1 rounded">http://localhost:3005</code>
          </p>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            All API requests require an API key. Include your API key in the{" "}
            <code className="bg-muted px-1 rounded">X-API-Key</code> header.
          </p>
          <CodeBlock
            code={`curl -X POST https://sentinel-debugger.vercel.app/api/simulate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here" \\
  -d '{"network": "testnet", ...}'`}
            language="bash"
          />
          <p className="text-muted-foreground text-sm">
            Create API keys in{" "}
            <a href="/settings/api-keys" className="text-primary underline">
              Settings &gt; API Keys
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="simulation">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="simulation">Simulate</TabsTrigger>
              <TabsTrigger value="debugger">Debug</TabsTrigger>
              <TabsTrigger value="prover">Prover</TabsTrigger>
              <TabsTrigger value="gas">Gas Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="simulation" className="mt-6">
              {endpoints.simulation.map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>
            <TabsContent value="debugger" className="mt-6">
              {endpoints.debugger.map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>
            <TabsContent value="prover" className="mt-6">
              {endpoints.prover.map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>
            <TabsContent value="gas" className="mt-6">
              {endpoints.gas.map((ep, i) => (
                <EndpointCard key={i} endpoint={ep} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Postman Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Postman / API Clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To test the API with Postman or any HTTP client:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              Get your API key from{" "}
              <a href="/settings/api-keys" className="text-primary underline">
                Settings &gt; API Keys
              </a>
            </li>
            <li>Set the base URL to your Sentinel instance</li>
            <li>
              Add the <code className="bg-muted px-1 rounded">X-API-Key</code>{" "}
              header to all requests
            </li>
            <li>
              Set <code className="bg-muted px-1 rounded">Content-Type</code> to{" "}
              <code className="bg-muted px-1 rounded">application/json</code>
            </li>
          </ol>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Example cURL Request</h4>
            <CodeBlock
              code={`curl -X POST http://localhost:3005/api/simulate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sk_live_xxxxxxxxxxxxxxxx" \\
  -d '{
    "network": "testnet",
    "sender": "0x1",
    "module_address": "0x1",
    "module_name": "coin",
    "function_name": "balance",
    "type_args": ["0x1::aptos_coin::AptosCoin"],
    "args": ["0x1"]
  }'`}
            language="bash"
          />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
