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
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Simulation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
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
          <p className="text-sm text-muted-foreground text-center py-8">
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
                <XCircle className="h-5 w-5 text-destructive" />
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
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${gasPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Gas Unit Price: {result.gasUnitPrice}
          </p>
        </div>

        {/* Error Details */}
        {result.error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">
              {result.error.code}
            </p>
            <p className="text-sm text-destructive/80 mt-1">
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
              <pre className="text-xs font-mono p-3 bg-muted rounded-lg overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
