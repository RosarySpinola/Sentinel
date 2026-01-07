import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectsResponse,
} from "@/lib/types/project";

const API_BASE = "";

export async function listProjects(walletAddress: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data: ProjectsResponse = await response.json();
  return data.projects;
}

export async function getProject(
  id: string,
  walletAddress: string
): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`, {
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
}

export async function createProject(
  input: CreateProjectInput,
  walletAddress: string
): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  return response.json();
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
  walletAddress: string
): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  return response.json();
}

export async function deleteProject(
  id: string,
  walletAddress: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "DELETE",
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
}
