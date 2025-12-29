export interface SimulationRequest {
  network: "mainnet" | "testnet";
  sender: string;
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArgs: string[];
  args: unknown[];
  maxGas?: number;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: number;
  gasUnitPrice: number;
  vmStatus: string;
  stateChanges: StateChange[];
  events: SimEvent[];
  error?: SimulationError;
}

export interface StateChange {
  address: string;
  resource: string;
  changeType: "write" | "delete" | "create";
  before?: unknown;
  after?: unknown;
}

export interface SimEvent {
  type: string;
  data: unknown;
  sequenceNumber: number;
}

export interface SimulationError {
  code: string;
  message: string;
  location?: {
    module: string;
    function: string;
    line?: number;
  };
}
