"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { GasSuggestion, Severity } from "../types";

interface SuggestionsListProps {
  suggestions: GasSuggestion[];
}

const severityConfig: Record<Severity, { icon: typeof Info; color: string; bg: string }> = {
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
          <p className="text-sm text-muted-foreground text-center py-8">
            No optimization suggestions found. Your code looks efficient!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
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
              <div
                key={index}
                className={`p-4 rounded-lg border ${config.bg}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${config.color}`}>
                        {suggestion.message}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        ~{suggestion.estimated_savings.toLocaleString()} gas
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                    {suggestion.location && (
                      <p className="text-xs font-mono text-muted-foreground mt-2">
                        {suggestion.location.module}::{suggestion.location.function}
                        {suggestion.location.line && `:${suggestion.location.line}`}
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
