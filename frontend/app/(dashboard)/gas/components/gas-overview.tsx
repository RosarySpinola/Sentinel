"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { GasProfile } from "../types";

interface GasOverviewProps {
  profile: GasProfile;
}

export function GasOverview({ profile }: GasOverviewProps) {
  const topOperation = profile.by_operation[0];
  const topFunction = profile.by_function[0];
  const totalSavings = profile.suggestions.reduce(
    (acc, s) => acc + s.estimated_savings,
    0
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Total Gas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {profile.total_gas.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            units consumed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Top Operation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">
            {topOperation?.operation || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {topOperation?.percentage.toFixed(1)}% of total gas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Function
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono truncate">
            {topFunction?.function || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {topFunction?.percentage.toFixed(1)}% ({topFunction?.gas_used.toLocaleString()} gas)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Potential Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ~{totalSavings.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {profile.suggestions.length} optimization{profile.suggestions.length !== 1 ? "s" : ""} found
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
