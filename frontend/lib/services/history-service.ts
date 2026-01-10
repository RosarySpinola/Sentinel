import type {
  SimulationHistory,
  ProverRunHistory,
  HistoryFilters,
  PaginatedResponse,
} from "@/lib/types/history";

// History routes are Next.js API routes (same origin), not external backend
// So we use empty string for same-origin requests
const API_BASE = "";

export interface HistoryServiceOptions {
  walletAddress?: string;
}

export async function listSimulations(
  filters?: HistoryFilters,
  options?: HistoryServiceOptions
): Promise<PaginatedResponse<SimulationHistory>> {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", filters.projectId);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));

  const headers: HeadersInit = {};
  if (options?.walletAddress) {
    headers["x-wallet-address"] = options.walletAddress;
  }

  const response = await fetch(
    `${API_BASE}/api/history/simulations?${params}`,
    {
      credentials: "include",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch simulations");
  }
  return response.json();
}

export async function getSimulation(
  id: string,
  options?: HistoryServiceOptions
): Promise<SimulationHistory> {
  const headers: HeadersInit = {};
  if (options?.walletAddress) {
    headers["x-wallet-address"] = options.walletAddress;
  }

  const response = await fetch(`${API_BASE}/api/history/simulations/${id}`, {
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch simulation");
  }
  return response.json();
}

export interface SaveSimulationData
  extends Omit<SimulationHistory, "id" | "createdAt"> {
  walletAddress?: string;
}

export async function saveSimulation(
  data: SaveSimulationData
): Promise<SimulationHistory> {
  const { walletAddress, ...rest } = data;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (walletAddress) {
    headers["x-wallet-address"] = walletAddress;
  }

  const response = await fetch(`${API_BASE}/api/history/simulations`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(rest),
  });
  if (!response.ok) {
    throw new Error("Failed to save simulation");
  }
  return response.json();
}

export async function listProverRuns(
  filters?: HistoryFilters,
  options?: HistoryServiceOptions
): Promise<PaginatedResponse<ProverRunHistory>> {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", filters.projectId);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));

  const headers: HeadersInit = {};
  if (options?.walletAddress) {
    headers["x-wallet-address"] = options.walletAddress;
  }

  const response = await fetch(
    `${API_BASE}/api/history/prover-runs?${params}`,
    {
      credentials: "include",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch prover runs");
  }
  return response.json();
}

export async function getProverRun(
  id: string,
  options?: HistoryServiceOptions
): Promise<ProverRunHistory> {
  const headers: HeadersInit = {};
  if (options?.walletAddress) {
    headers["x-wallet-address"] = options.walletAddress;
  }

  const response = await fetch(`${API_BASE}/api/history/prover-runs/${id}`, {
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch prover run");
  }
  return response.json();
}

export interface SaveProverRunData
  extends Omit<ProverRunHistory, "id" | "createdAt"> {
  walletAddress?: string;
}

export async function saveProverRun(
  data: SaveProverRunData
): Promise<ProverRunHistory> {
  const { walletAddress, ...rest } = data;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (walletAddress) {
    headers["x-wallet-address"] = walletAddress;
  }

  const response = await fetch(`${API_BASE}/api/history/prover-runs`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(rest),
  });
  if (!response.ok) {
    throw new Error("Failed to save prover run");
  }
  return response.json();
}
