export type Severity = "info" | "warning" | "critical";

export interface GasAnalysisRequest {
  network: "mainnet" | "testnet";
  sender: string;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArgs: string[];
  args: unknown[];
}

export interface OperationGas {
  operation: string;
  count: number;
  total_gas: number;
  percentage: number;
}

export interface FunctionGas {
  module: string;
  function: string;
  gas_used: number;
  percentage: number;
  calls: number;
}

export interface SourceLocation {
  module: string;
  function: string;
  line?: number;
}

export interface GasSuggestion {
  severity: Severity;
  message: string;
  description: string;
  location?: SourceLocation;
  estimated_savings: number;
}

export interface GasStep {
  step: number;
  gas_total: number;
  gas_delta: number;
  operation: string;
}

export interface GasProfile {
  total_gas: number;
  by_operation: OperationGas[];
  by_function: FunctionGas[];
  suggestions: GasSuggestion[];
  steps: GasStep[];
}
