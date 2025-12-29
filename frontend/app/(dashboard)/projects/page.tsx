"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";
import { useProjects } from "./hooks/use-projects";
import { ProjectCard } from "./components/project-card";
import { CreateProjectDialog } from "./components/create-project-dialog";
import { EditProjectDialog } from "./components/edit-project-dialog";
import { useProject } from "@/lib/contexts/project-context";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types/project";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjects();
  const { setSelectedProject } = useProject();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    router.push("/simulator");
  };

  const handleEdit = (project: Project) => {
    setSelectedProjectForEdit(project);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first project to organize your simulations and prover runs.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (input) => {
          await createProject(input);
        }}
      />

      <EditProjectDialog
        project={selectedProjectForEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={async (id, input) => {
          await updateProject(id, input);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}&quot;? This action
              cannot be undone and will delete all associated simulations and prover runs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
