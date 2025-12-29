"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { useGasProfile } from "./hooks/use-gas-profile";
import { GasForm } from "./components/gas-form";
import { GasOverview } from "./components/gas-overview";
import { OperationBreakdown } from "./components/operation-breakdown";
import { FunctionBreakdown } from "./components/function-breakdown";
import { SuggestionsList } from "./components/suggestions-list";
import { GasTimelineChart } from "./components/gas-timeline-chart";

export default function GasPage() {
  const { profile, isLoading, error, analyzeTransaction, loadDemo, clear } = useGasProfile();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gas Profiler</h1>
          <p className="text-muted-foreground mt-1">
            Analyze gas consumption and find optimization opportunities
          </p>
        </div>
        {profile && (
          <Button variant="outline" onClick={clear}>
            <X className="h-4 w-4 mr-2" />
            Clear Analysis
          </Button>
        )}
      </div>

      <GasForm
        onAnalyze={analyzeTransaction}
        onLoadDemo={loadDemo}
        isLoading={isLoading}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Analyzing gas usage...</p>
          </CardContent>
        </Card>
      )}

      {profile && !isLoading && (
        <>
          <GasOverview profile={profile} />

          <div className="grid gap-6 lg:grid-cols-2">
            <OperationBreakdown operations={profile.by_operation} />
            <FunctionBreakdown functions={profile.by_function} />
          </div>

          <GasTimelineChart steps={profile.steps} />

          <SuggestionsList suggestions={profile.suggestions} />
        </>
      )}
    </div>
  );
}
