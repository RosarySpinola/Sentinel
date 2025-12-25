import type {
  SimulationHistory,
  ProverRunHistory,
  DebuggerHistory,
  GasAnalysisHistory,
  HistoryFilters,
  PaginatedResponse,
} from "@/lib/types/history";

// History routes are Next.js API routes (same origin), not external backend
// So we use empty string for same-origin requests
const API_BASE = "";

// Map snake_case API response to camelCase for frontend types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSimulation(item: any): SimulationHistory {
  return {
    id: item.id,
    projectId: item.project_id,
    network: item.network,
    senderAddress: item.sender_address,
    moduleAddress: item.module_address,
    moduleName: item.module_name,
    functionName: item.function_name,
    typeArguments: item.type_arguments,
    arguments: item.arguments,
    success: item.success,
    gasUsed: item.gas_used || 0,
    vmStatus: item.vm_status,
    stateChanges: item.state_changes,
    events: item.events,
    errorMessage: item.error_message,
    createdAt: item.created_at,
    result: item.result,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProverRun(item: any): ProverRunHistory {
  return {
    id: item.id,
    projectId: item.project_id,
    code: item.code,
    modules: item.modules || [],
    status: item.status,
    durationMs: item.duration_ms || 0,
    results: item.results,
    errorMessage: item.error_message,
    createdAt: item.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDebuggerRun(item: any): DebuggerHistory {
  return {
    id: item.id,
    projectId: item.project_id,
    network: item.network,
    senderAddress: item.sender_address,
    moduleAddress: item.module_address,
    moduleName: item.module_name,
    functionName: item.function_name,
    typeArguments: item.type_arguments,
    arguments: item.arguments,
    totalSteps: item.total_steps || 0,
    totalGas: item.total_gas || 0,
    createdAt: item.created_at,
    result: item.result,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGasAnalysis(item: any): GasAnalysisHistory {
  return {
    id: item.id,
    projectId: item.project_id,
    network: item.network,
    senderAddress: item.sender_address,
    moduleAddress: item.module_address,
    moduleName: item.module_name,
    functionName: item.function_name,
    typeArguments: item.type_arguments,
    arguments: item.arguments,
    totalGas: item.total_gas || 0,
    topOperation: item.top_operation,
    topFunction: item.top_function,
    suggestionsCount: item.suggestions_count || 0,
    createdAt: item.created_at,
    result: item.result,
  };
}

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
  const data = await response.json();
  return {
    ...data,
    items: (data.items || []).map(mapSimulation),
  };
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
  const data = await response.json();
  return {
    ...data,
    items: (data.items || []).map(mapProverRun),
  };
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

export async function listDebuggerRuns(
  filters?: HistoryFilters,
  options?: HistoryServiceOptions
): Promise<PaginatedResponse<DebuggerHistory>> {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", filters.projectId);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));

  const headers: HeadersInit = {};
  if (options?.walletAddress) {
    headers["x-wallet-address"] = options.walletAddress;
  }

  const response = await fetch(
    `${API_BASE}/api/history/debugger-runs?${params}`,
    {
      credentials: "include",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch debugger runs");
  }
  const data = await response.json();
  return {
    ...data,
    items: (data.items || []).map(mapDebuggerRun),
  };
}

export interface SaveDebuggerRunData
  extends Omit<DebuggerHistory, "id" | "createdAt"> {
  walletAddress?: string;
}

export async function saveDebuggerRun(
  data: SaveDebuggerRunData
): Promise<DebuggerHistory> {
  const { walletAddress, ...rest } = data;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (walletAddress) {
    headers["x-wallet-address"] = walletAddress;
  }

  const response = await fetch(`${API_BASE}/api/history/debugger-runs`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(rest),
  });
  if (!response.ok) {
    throw new Error("Failed to save debugger run");
  }
  return response.json();
}

export async function listGasAnalyses(
  filters?: HistoryFilters,
  options?: HistoryServiceOptions
): Promise<PaginatedResponse<GasAnalysisHistory>> {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", filters.projectId);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));

  const headers: HeadersInit = {};
  if (options?.walletAddress) {
    headers["x-wallet-address"] = options.walletAddress;
  }

  const response = await fetch(
    `${API_BASE}/api/history/gas-analyses?${params}`,
    {
      credentials: "include",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch gas analyses");
  }
  const data = await response.json();
  return {
    ...data,
    items: (data.items || []).map(mapGasAnalysis),
  };
}

export interface SaveGasAnalysisData
  extends Omit<GasAnalysisHistory, "id" | "createdAt"> {
  walletAddress?: string;
}

export async function saveGasAnalysis(
  data: SaveGasAnalysisData
): Promise<GasAnalysisHistory> {
  const { walletAddress, ...rest } = data;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (walletAddress) {
    headers["x-wallet-address"] = walletAddress;
  }

  const response = await fetch(`${API_BASE}/api/history/gas-analyses`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(rest),
  });
  if (!response.ok) {
    throw new Error("Failed to save gas analysis");
  }
  return response.json();
}
