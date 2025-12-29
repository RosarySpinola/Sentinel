export type NetworkType = "mainnet" | "testnet" | "devnet";

export interface Project {
  id: string;
  name: string;
  description?: string;
  network: NetworkType;
  createdAt: string;
  updatedAt: string;
  simulationCount?: number;
  proverRunCount?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  network?: NetworkType;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  network?: NetworkType;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
}
