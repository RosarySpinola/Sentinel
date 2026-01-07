"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Project } from "@/lib/types/project";

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projectId: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = "sentinel-selected-project";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(
    null
  );

  // Load selected project from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const project = JSON.parse(stored);
        setSelectedProjectState(project);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const setSelectedProject = (project: Project | null) => {
    setSelectedProjectState(project);
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        projectId: selectedProject?.id ?? null,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
