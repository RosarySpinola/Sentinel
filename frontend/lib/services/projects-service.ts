import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectsResponse,
} from "@/lib/types/project";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function listProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data: ProjectsResponse = await response.json();
  return data.projects;
}

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  return response.json();
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  return response.json();
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
}
