export interface SimulationHistory {
  id: string;
  projectId?: string;
  network: string;
  senderAddress: string;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArguments?: string[];
  arguments?: unknown[];
  success: boolean;
  gasUsed: number;
  vmStatus?: string;
  stateChanges?: unknown[];
  events?: unknown[];
  errorMessage?: string;
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

export interface DebuggerHistory {
  id: string;
  projectId?: string;
  network: string;
  senderAddress: string;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArguments?: string[];
  arguments?: unknown[];
  totalSteps: number;
  totalGas: number;
  createdAt: string;
  result?: Record<string, unknown>;
}

export interface GasAnalysisHistory {
  id: string;
  projectId?: string;
  network: string;
  senderAddress: string;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArguments?: string[];
  arguments?: unknown[];
  totalGas: number;
  topOperation: string;
  topFunction: string;
  suggestionsCount: number;
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
