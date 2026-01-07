/**
 * Parse Move abort codes into human-readable error messages
 */

// Standard Move abort code categories (from aptos-core)
const ABORT_CATEGORIES: Record<number, string> = {
  0: "INVALID_STATE",
  1: "REQUIRES_ADDRESS",
  2: "REQUIRES_ROLE",
  3: "REQUIRES_CAPABILITY",
  4: "NOT_PUBLISHED",
  5: "ALREADY_PUBLISHED",
  6: "INVALID_ARGUMENT",
  7: "LIMIT_EXCEEDED",
  8: "INTERNAL",
  10: "NOT_FOUND",
  15: "PERMISSION_DENIED",
};

// Common account module errors (0x1::account)
const ACCOUNT_ERRORS: Record<number, string> = {
  1: "Account already exists",
  2: "Account does not exist",
  3: "Sequence number exceeds max",
  4: "Malformed authentication key",
  5: "Cannot create account at reserved address",
  6: "Out of gas",
  7: "Writeset transaction not allowed",
  8: "Module bundle not allowed",
  9: "Invalid transaction sender",
  10: "Invalid module publisher",
  11: "Expecting sequence number",
  12: "Sequence number too old",
  13: "Sequence number too new",
  14: "Account cannot pay gas",
  15: "Secondary keys count mismatch",
  16: "Signers count mismatch",
  17: "Sequence number too big",
  18: "Bad chain ID",
  19: "Resource account exists",
  20: "Account does not exist",
};

// Common coin module errors (0x1::coin)
const COIN_ERRORS: Record<number, string> = {
  1: "Coin store not published",
  2: "Coin store already exists",
  3: "Insufficient balance",
  4: "Coin type mismatch",
  5: "Coin info not published",
  6: "Coin info already exists",
  7: "Coin store frozen",
  8: "Zero coin amount",
};

// Prologue abort codes
const PROLOGUE_ERRORS: Record<number, string> = {
  1: "Invalid account authentication key",
  2: "Sequence number too old",
  3: "Sequence number too new",
  4: "Account does not exist",
  5: "Cannot pay gas deposit",
  6: "Transaction expired",
  7: "Bad chain ID",
  8: "Sequence number too big",
  9: "Secondary keys addresses count mismatch",
};

export interface ParsedError {
  shortCode: string;
  title: string;
  description: string;
  suggestion?: string;
  module?: string;
  category?: string;
  reason?: number;
}

/**
 * Parse a VM status string into a structured error
 */
export function parseVmStatus(vmStatus: string): ParsedError {
  // Check for success
  if (vmStatus === "Executed successfully" || vmStatus === "success") {
    return {
      shortCode: "SUCCESS",
      title: "Success",
      description: "Transaction executed successfully",
    };
  }

  // Check for common error patterns
  const executionFailedMatch = vmStatus.match(
    /UNEXPECTED_ERROR_FROM_KNOWN_MOVE_FUNCTION.*?\[aptos_vm\]\s*(.*)/i
  );
  if (executionFailedMatch) {
    return parseMoveFunctionError(vmStatus, executionFailedMatch[1]);
  }

  // Check for Move abort pattern
  const abortMatch = vmStatus.match(
    /Move abort.*?(0x[a-fA-F0-9]+)::(\w+)::(\d+)/
  );
  if (abortMatch) {
    return parseMoveAbort(abortMatch[1], abortMatch[2], parseInt(abortMatch[3]));
  }

  // Check for generic execution failed
  if (vmStatus.includes("EXECUTION_FAILED")) {
    return {
      shortCode: "EXEC_FAILED",
      title: "Execution Failed",
      description: vmStatus,
      suggestion: "Check that all function arguments are correct",
    };
  }

  // Check for out of gas
  if (vmStatus.includes("OUT_OF_GAS")) {
    return {
      shortCode: "OUT_OF_GAS",
      title: "Out of Gas",
      description: "Transaction ran out of gas during execution",
      suggestion: "Increase the max gas amount",
    };
  }

  // Unknown error
  return {
    shortCode: "ERROR",
    title: "Transaction Failed",
    description: vmStatus,
  };
}

function parseMoveFunctionError(fullStatus: string, message: string): ParsedError {
  // Parse "Unexpected prologue Move abort" pattern
  const prologueMatch = message.match(
    /Unexpected prologue.*?(0x[a-fA-F0-9]+)::(\w+)::(\d+).*?Category:\s*(\d+)\s*Reason:\s*(\d+)/i
  );

  if (prologueMatch) {
    const [, address, module, , category, reason] = prologueMatch;
    const categoryNum = parseInt(category);
    const reasonNum = parseInt(reason);

    // Get prologue error description
    const prologueDesc = PROLOGUE_ERRORS[reasonNum] || `Unknown prologue error (reason: ${reasonNum})`;

    return {
      shortCode: "PROLOGUE_ERROR",
      title: "Prologue Error",
      description: prologueDesc,
      module: `${address}::${module}`,
      category: ABORT_CATEGORIES[categoryNum] || `Category ${categoryNum}`,
      reason: reasonNum,
      suggestion: getSuggestionForPrologueError(reasonNum),
    };
  }

  // Generic move abort in message
  const abortMatch = message.match(/(0x[a-fA-F0-9]+)::(\w+)::(\d+)/);
  if (abortMatch) {
    return parseMoveAbort(abortMatch[1], abortMatch[2], parseInt(abortMatch[3]));
  }

  return {
    shortCode: "MOVE_ERROR",
    title: "Move Function Error",
    description: message,
  };
}

function parseMoveAbort(
  address: string,
  module: string,
  errorCode: number
): ParsedError {
  const fullModule = `${address}::${module}`;

  // Try to decode the error code
  // Standard format: (category << 16) | reason
  const category = (errorCode >> 16) & 0xff;
  const reason = errorCode & 0xffff;

  let description = `Error code ${errorCode}`;
  let suggestion: string | undefined;

  // Get module-specific error
  if (module.toLowerCase() === "account") {
    description = ACCOUNT_ERRORS[reason] || description;
    suggestion = getAccountErrorSuggestion(reason);
  } else if (module.toLowerCase() === "coin") {
    description = COIN_ERRORS[reason] || description;
    suggestion = getCoinErrorSuggestion(reason);
  }

  return {
    shortCode: "MOVE_ABORT",
    title: "Move Abort",
    description,
    module: fullModule,
    category: ABORT_CATEGORIES[category],
    reason: errorCode,
    suggestion,
  };
}

function getSuggestionForPrologueError(reason: number): string {
  switch (reason) {
    case 1:
      return "Check that the sender address has been correctly derived from the authentication key";
    case 2:
      return "The sequence number is too old. Get the latest sequence number from the account";
    case 3:
      return "The sequence number is too new. Wait for pending transactions to complete";
    case 4:
      return "The sender account does not exist on chain. Fund the account first";
    case 5:
      return "The account doesn't have enough balance to pay for gas";
    case 6:
      return "The transaction has expired. Increase the expiration timestamp";
    case 7:
      return "The chain ID doesn't match. Check you're connected to the right network";
    default:
      return "Check the transaction parameters and account state";
  }
}

function getAccountErrorSuggestion(reason: number): string | undefined {
  switch (reason) {
    case 1:
      return "This account address is already registered on chain";
    case 2:
    case 20:
      return "Fund the account before using it, or check the address is correct";
    case 14:
      return "Ensure the account has enough balance to cover gas fees";
    default:
      return undefined;
  }
}

function getCoinErrorSuggestion(reason: number): string | undefined {
  switch (reason) {
    case 1:
      return "Register the coin store for this account first";
    case 3:
      return "Check that the account has sufficient balance";
    default:
      return undefined;
  }
}

/**
 * Extract a short status code from a long VM status
 */
export function getShortStatus(vmStatus: string): string {
  const parsed = parseVmStatus(vmStatus);
  return parsed.shortCode;
}
