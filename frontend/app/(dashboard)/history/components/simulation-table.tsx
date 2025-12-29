"use client";

import { SimulationHistory } from "@/lib/types/history";
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

interface SimulationTableProps {
  simulations: SimulationHistory[];
  onView: (simulation: SimulationHistory) => void;
  onRerun: (simulation: SimulationHistory) => void;
  isLoading?: boolean;
}

export function SimulationTable({
  simulations,
  onView,
  onRerun,
  isLoading,
}: SimulationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No simulations found
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
          <TableHead>Status</TableHead>
          <TableHead>Gas</TableHead>
          <TableHead>Network</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {simulations.map((sim) => (
          <TableRow key={sim.id}>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(sim.createdAt))}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {sim.moduleName}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {sim.functionName}
            </TableCell>
            <TableCell>
              <Badge variant={sim.success ? "default" : "destructive"}>
                {sim.success ? "Success" : "Failed"}
              </Badge>
            </TableCell>
            <TableCell className="font-mono">
              {sim.gasUsed.toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{sim.network}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onView(sim)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRerun(sim)}>
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
