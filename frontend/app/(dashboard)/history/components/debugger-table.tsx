"use client";

import { DebuggerHistory } from "@/lib/types/history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/format";

interface DebuggerTableProps {
  debuggerRuns: DebuggerHistory[];
  onView: (run: DebuggerHistory) => void;
  onRerun: (run: DebuggerHistory) => void;
  isLoading?: boolean;
}

export function DebuggerTable({
  debuggerRuns,
  onView,
  onRerun,
  isLoading,
}: DebuggerTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (debuggerRuns.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No debug sessions found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Function</TableHead>
          <TableHead>Steps</TableHead>
          <TableHead>Gas</TableHead>
          <TableHead>Network</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {debuggerRuns.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(run.createdAt))}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {run.moduleName}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {run.functionName}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{run.totalSteps} steps</Badge>
            </TableCell>
            <TableCell className="font-mono">
              {run.totalGas.toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{run.network}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onView(run)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRerun(run)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
