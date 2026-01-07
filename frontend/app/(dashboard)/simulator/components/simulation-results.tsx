"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Fuel } from "lucide-react";
import { SimulationResult } from "../types";
import { StateDiffView } from "./state-diff-view";
import { EventsList } from "./events-list";

interface SimulationResultsProps {
  result: SimulationResult | null;
  error: string | null;
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
          <p className="text-destructive text-sm">{error}</p>
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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
          <Badge variant="outline">{result.vmStatus}</Badge>
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

        {/* Error Details */}
        {result.error && (
          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
            <p className="text-destructive text-sm font-medium">
              {result.error.code}
            </p>
            <p className="text-destructive/80 mt-1 text-sm">
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
              <pre className="bg-muted overflow-auto rounded-lg p-3 font-mono text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
