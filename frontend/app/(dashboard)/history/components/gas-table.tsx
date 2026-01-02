"use client";

import { GasAnalysisHistory } from "@/lib/types/history";
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

interface GasTableProps {
  gasAnalyses: GasAnalysisHistory[];
  onView: (analysis: GasAnalysisHistory) => void;
  onRerun: (analysis: GasAnalysisHistory) => void;
  isLoading?: boolean;
}

export function GasTable({
  gasAnalyses,
  onView,
  onRerun,
  isLoading,
}: GasTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (gasAnalyses.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No gas analyses found
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
          <TableHead>Gas Used</TableHead>
          <TableHead>Top Operation</TableHead>
          <TableHead>Network</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gasAnalyses.map((analysis) => (
          <TableRow key={analysis.id}>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(analysis.createdAt))}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {analysis.moduleName}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {analysis.functionName}
            </TableCell>
            <TableCell className="font-mono">
              {analysis.totalGas.toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{analysis.topOperation}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{analysis.network}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onView(analysis)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRerun(analysis)}
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
