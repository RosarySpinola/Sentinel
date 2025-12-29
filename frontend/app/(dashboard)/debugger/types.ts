export interface TraceRequest {
  network: 'mainnet' | 'testnet';
  sender: string;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArgs: string[];
  args: unknown[];
}

export interface ExecutionStep {
  step_number: number;
  instruction: string;
  module_name: string;
  function_name: string;
  line_number?: number;
  gas_delta: number;
  gas_total: number;
  stack: StackFrame[];
  locals: LocalVariable[];
}

export interface StackFrame {
  module_name: string;
  function_name: string;
  depth: number;
}

export interface LocalVariable {
  name: string;
  var_type: string;
  value: unknown;
}

export interface TraceResult {
  success: boolean;
  steps: ExecutionStep[];
  total_gas: number;
  error?: string;
}
