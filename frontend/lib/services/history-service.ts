import type {
  SimulationHistory,
  ProverRunHistory,
  HistoryFilters,
  PaginatedResponse,
} from "@/lib/types/history";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function listSimulations(
  filters?: HistoryFilters
): Promise<PaginatedResponse<SimulationHistory>> {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", filters.projectId);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));

  const response = await fetch(`${API_BASE}/api/history/simulations?${params}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch simulations");
  }
  return response.json();
}

export async function getSimulation(id: string): Promise<SimulationHistory> {
  const response = await fetch(`${API_BASE}/api/history/simulations/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch simulation");
  }
  return response.json();
}

export async function saveSimulation(
  data: Omit<SimulationHistory, "id" | "createdAt">
): Promise<SimulationHistory> {
  const response = await fetch(`${API_BASE}/api/history/simulations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to save simulation");
  }
  return response.json();
}

export async function listProverRuns(
  filters?: HistoryFilters
): Promise<PaginatedResponse<ProverRunHistory>> {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", filters.projectId);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));

  const response = await fetch(`${API_BASE}/api/history/prover-runs?${params}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch prover runs");
  }
  return response.json();
}

export async function getProverRun(id: string): Promise<ProverRunHistory> {
  const response = await fetch(`${API_BASE}/api/history/prover-runs/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch prover run");
  }
  return response.json();
}

export async function saveProverRun(
  data: Omit<ProverRunHistory, "id" | "createdAt">
): Promise<ProverRunHistory> {
  const response = await fetch(`${API_BASE}/api/history/prover-runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to save prover run");
  }
  return response.json();
}
