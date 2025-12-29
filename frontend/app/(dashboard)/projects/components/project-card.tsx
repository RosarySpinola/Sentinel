"use client";

import { Project, NetworkType } from "@/lib/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Zap, ShieldCheck } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onClick: (project: Project) => void;
}

const networkColors: Record<NetworkType, string> = {
  mainnet: "bg-red-500/10 text-red-500 border-red-500/20",
  testnet: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  devnet: "bg-green-500/10 text-green-500 border-green-500/20",
};

export function ProjectCard({ project, onEdit, onDelete, onClick }: ProjectCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onClick(project)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant="outline" className={networkColors[project.network]}>
            {project.network}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>{project.simulationCount ?? 0} simulations</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            <span>{project.proverRunCount ?? 0} prover runs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
