export interface SimulationHistory {
  id: string;
  projectId?: string;
  sender: string;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  success: boolean;
  gasUsed: number;
  network: string;
  createdAt: string;
  result?: Record<string, unknown>;
}

export interface ProverRunHistory {
  id: string;
  projectId?: string;
  moduleName: string;
  status: "passed" | "failed" | "timeout" | "error";
  durationMs: number;
  createdAt: string;
  result?: Record<string, unknown>;
}

export interface HistoryFilters {
  projectId?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
