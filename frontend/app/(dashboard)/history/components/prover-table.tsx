"use client";

import { ProverRunHistory } from "@/lib/types/history";
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
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/format";

interface ProverTableProps {
  proverRuns: ProverRunHistory[];
  onView: (run: ProverRunHistory) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  passed: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  timeout: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function ProverTable({
  proverRuns,
  onView,
  isLoading,
}: ProverTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (proverRuns.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No prover runs found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proverRuns.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(run.createdAt))}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {run.modules?.join(", ") || "-"}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={statusColors[run.status]}>
                {run.status}
              </Badge>
            </TableCell>
            <TableCell className="font-mono">
              {run.durationMs ? `${(run.durationMs / 1000).toFixed(2)}s` : "-"}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onView(run)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
