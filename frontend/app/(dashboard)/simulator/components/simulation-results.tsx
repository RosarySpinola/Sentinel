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
  ChevronDown,
  ChevronUp,
  Code,
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

interface ErrorDisplayProps {
  parsedError: ParsedError;
  rawVmStatus: string;
}

function ErrorDisplay({ parsedError, rawVmStatus }: ErrorDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const copyError = () => {
    const errorText = [
      `Error: ${parsedError.title}`,
      `Code: ${parsedError.shortCode}`,
      parsedError.module && `Module: ${parsedError.module}`,
      parsedError.category && `Category: ${parsedError.category}`,
      parsedError.reason !== undefined && `Reason Code: ${parsedError.reason}`,
      `Description: ${parsedError.description}`,
      parsedError.suggestion && `Suggestion: ${parsedError.suggestion}`,
      `\nRaw VM Status:\n${rawVmStatus}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-destructive/10 border-destructive/30 space-y-3 rounded-lg border p-4">
      {/* Error Header with Description */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="space-y-1.5">
            <p className="text-destructive text-base font-semibold">
              {parsedError.description}
            </p>
            {/* Module & Category & Reason Tags */}
            <div className="flex flex-wrap gap-1.5">
              {parsedError.module && (
                <Badge variant="outline" className="font-mono text-xs">
                  {parsedError.module}
                </Badge>
              )}
              {parsedError.category && (
                <Badge variant="secondary" className="text-xs">
                  {parsedError.category}
                </Badge>
              )}
              {parsedError.reason !== undefined && (
                <Badge variant="secondary" className="font-mono text-xs">
                  Code: {parsedError.reason}
                </Badge>
              )}
            </div>
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

      {/* Suggestion */}
      {parsedError.suggestion && (
        <div className="bg-yellow-500/10 border-yellow-500/30 flex items-start gap-2.5 rounded-md border p-3">
          <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              How to fix
            </p>
            <p className="text-foreground mt-0.5 text-sm">
              {parsedError.suggestion}
            </p>
          </div>
        </div>
      )}

      {/* Technical Details - Collapsible */}
      <div className="border-t border-destructive/20 pt-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between text-sm transition-colors"
        >
          <span className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Technical Details
          </span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showDetails && (
          <div className="mt-3 space-y-2">
            {/* Error Type */}
            <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
              <span className="text-muted-foreground">Error Type:</span>
              <span className="font-mono">{parsedError.shortCode}</span>
            </div>
            {parsedError.module && (
              <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                <span className="text-muted-foreground">Module:</span>
                <span className="font-mono">{parsedError.module}</span>
              </div>
            )}
            {parsedError.category && (
              <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                <span className="text-muted-foreground">Category:</span>
                <span>{parsedError.category}</span>
              </div>
            )}
            {parsedError.reason !== undefined && (
              <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                <span className="text-muted-foreground">Abort Code:</span>
                <span className="font-mono">{parsedError.reason}</span>
              </div>
            )}
            {/* Raw VM Status */}
            <div className="mt-2">
              <span className="text-muted-foreground text-xs">
                Raw VM Status:
              </span>
              <pre className="bg-muted/50 mt-1 overflow-x-auto rounded p-2 font-mono text-xs break-all whitespace-pre-wrap">
                {rawVmStatus}
              </pre>
            </div>
          </div>
        )}
      </div>
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
          <ErrorDisplay parsedError={parsedError} rawVmStatus={result.vmStatus} />
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
