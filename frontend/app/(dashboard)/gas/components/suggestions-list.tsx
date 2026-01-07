"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { GasSuggestion, Severity } from "../types";

interface SuggestionsListProps {
  suggestions: GasSuggestion[];
}

const severityConfig: Record<
  Severity,
  { icon: typeof Info; color: string; bg: string }
> = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  critical: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
};

export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            No optimization suggestions found. Your code looks efficient!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span>Optimization Suggestions</span>
          <Badge variant="secondary">{suggestions.length} found</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const config = severityConfig[suggestion.severity];
            const Icon = config.icon;

            return (
              <div key={index} className={`rounded-lg border p-4 ${config.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 ${config.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`font-medium ${config.color}`}>
                        {suggestion.message}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        ~{suggestion.estimated_savings.toLocaleString()} gas
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {suggestion.description}
                    </p>
                    {suggestion.location && (
                      <p className="text-muted-foreground mt-2 font-mono text-xs">
                        {suggestion.location.module}::
                        {suggestion.location.function}
                        {suggestion.location.line &&
                          `:${suggestion.location.line}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
