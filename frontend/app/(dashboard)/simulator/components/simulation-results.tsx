"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  Fuel,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import { SimulationResult } from "../types";
import { StateDiffView } from "./state-diff-view";
import { EventsList } from "./events-list";
import { parseVmStatus, ParsedError } from "../utils/error-parser";
import { useState } from "react";

interface SimulationResultsProps {
  result: SimulationResult | null;
  error: string | null;
}

function ErrorDisplay({ parsedError }: { parsedError: ParsedError }) {
  const [copied, setCopied] = useState(false);

  const copyError = () => {
    const errorText = [
      `Error: ${parsedError.title}`,
      `Code: ${parsedError.shortCode}`,
      parsedError.module && `Module: ${parsedError.module}`,
      parsedError.category && `Category: ${parsedError.category}`,
      `Description: ${parsedError.description}`,
      parsedError.suggestion && `Suggestion: ${parsedError.suggestion}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-destructive/10 border-destructive/30 space-y-3 rounded-lg border p-4">
      {/* Error Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="text-destructive text-sm font-semibold">
              {parsedError.title}
            </p>
            <Badge
              variant="outline"
              className="border-destructive/30 text-destructive mt-1 text-xs"
            >
              {parsedError.shortCode}
            </Badge>
          </div>
        </div>
        <button
          onClick={copyError}
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          title="Copy error details"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Module & Category */}
      {(parsedError.module || parsedError.category) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {parsedError.module && (
            <span className="bg-muted rounded px-2 py-1 font-mono">
              {parsedError.module}
            </span>
          )}
          {parsedError.category && (
            <span className="bg-muted rounded px-2 py-1">
              {parsedError.category}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-destructive/90 break-words text-sm">
        {parsedError.description}
      </p>

      {/* Suggestion */}
      {parsedError.suggestion && (
        <div className="bg-muted/50 flex items-start gap-2 rounded-md p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
          <p className="text-muted-foreground text-sm">
            {parsedError.suggestion}
          </p>
        </div>
      )}
    </div>
  );
}

export function SimulationResults({ result, error }: SimulationResultsProps) {
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Simulation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive break-words text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            Run a simulation to see results here
          </p>
        </CardContent>
      </Card>
    );
  }

  const gasPercentage = Math.min((result.gasUsed / 100000) * 100, 100);
  const parsedError = result.vmStatus ? parseVmStatus(result.vmStatus) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-500">Success</span>
              </>
            ) : (
              <>
                <XCircle className="text-destructive h-5 w-5" />
                <span className="text-destructive">Failed</span>
              </>
            )}
          </CardTitle>
          <Badge
            variant={result.success ? "default" : "destructive"}
            className="max-w-[200px] truncate"
            title={result.vmStatus}
          >
            {parsedError?.shortCode || result.vmStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gas Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Gas Used
            </span>
            <span className="font-mono">
              {result.gasUsed.toLocaleString()} / 100,000
            </span>
          </div>
          <div className="bg-secondary h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${gasPercentage}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Gas Unit Price: {result.gasUnitPrice}
          </p>
        </div>

        {/* Parsed Error Details */}
        {!result.success && parsedError && (
          <ErrorDisplay parsedError={parsedError} />
        )}

        {/* Legacy error details (if error object exists but differs) */}
        {result.error && result.error.message !== parsedError?.description && (
          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="text-sm font-medium">{result.error.code}</p>
            <p className="text-muted-foreground mt-1 break-words text-sm">
              {result.error.message}
            </p>
          </div>
        )}

        {/* Tabs for State Changes, Events, Raw */}
        <Tabs defaultValue="state" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="state">
              State ({result.stateChanges.length})
            </TabsTrigger>
            <TabsTrigger value="events">
              Events ({result.events.length})
            </TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="state" className="mt-4">
            <ScrollArea className="h-[300px]">
              <StateDiffView changes={result.stateChanges} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <ScrollArea className="h-[300px]">
              <EventsList events={result.events} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <ScrollArea className="h-[300px]">
              <pre className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
