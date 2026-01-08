// Prover request/response types matching the API

export type ProverStatus = "passed" | "failed" | "timeout" | "error";

export interface ProverRequest {
  move_code: string;
  module_name: string;
  specs: string[];
  timeout_seconds: number;
}

export interface Counterexample {
  inputs: Record<string, string>;
  failed_assertion: string;
}

export interface SpecResult {
  name: string;
  function: string;
  status: ProverStatus;
  counterexample?: Counterexample;
}

export interface ModuleResult {
  name: string;
  status: ProverStatus;
  specs: SpecResult[];
}

export interface ProverResult {
  status: ProverStatus;
  duration_ms: number;
  modules: ModuleResult[];
  summary: string;
  raw_output?: string;
}

export interface UseProverReturn {
  result: ProverResult | null;
  isLoading: boolean;
  error: string | null;
  runProver: (code: string, moduleName: string) => Promise<void>;
  clear: () => void;
}
