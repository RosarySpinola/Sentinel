"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/lib/types/project";
import * as projectsService from "@/lib/services/projects-service";
import { toast } from "sonner";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsService.listProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (input: CreateProjectInput): Promise<Project | null> => {
    try {
      const project = await projectsService.createProject(input);
      setProjects((prev) => [project, ...prev]);
      toast.success("Project created successfully");
      return project;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
      return null;
    }
  };

  const updateProject = async (
    id: string,
    input: UpdateProjectInput
  ): Promise<Project | null> => {
    try {
      const project = await projectsService.updateProject(id, input);
      setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
      toast.success("Project updated successfully");
      return project;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update project");
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      await projectsService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted successfully");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
      return false;
    }
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
