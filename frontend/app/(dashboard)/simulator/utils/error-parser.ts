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

// Prologue abort codes (from aptos-core/aptos-vm)
const PROLOGUE_ERRORS: Record<number, string> = {
  1: "Invalid account authentication key",
  2: "Account does not exist",
  3: "Sequence number too old",
  4: "Sequence number too new",
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

// Regex to match Move addresses (with or without 0x prefix, any length)
const ADDRESS_PATTERN = "(?:0x)?([a-fA-F0-9]+)";

/**
 * Normalize a Move address to short form (0x1 instead of 64 zeros + 1)
 */
function normalizeAddress(addr: string): string {
  // Remove 0x prefix if present
  const clean = addr.replace(/^0x/, "");
  // Remove leading zeros and add 0x prefix
  const trimmed = clean.replace(/^0+/, "") || "0";
  return `0x${trimmed}`;
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

  // Check for common error patterns - UNEXPECTED_ERROR_FROM_KNOWN_MOVE_FUNCTION
  const executionFailedMatch = vmStatus.match(
    /UNEXPECTED_ERROR_FROM_KNOWN_MOVE_FUNCTION[\s\S]*?\[aptos_vm\]\s*([\s\S]*)/i
  );
  if (executionFailedMatch) {
    return parseMoveFunctionError(vmStatus, executionFailedMatch[1]);
  }

  // Check for Move abort pattern (handles both 0x1 and full 64-char addresses)
  const abortRegex = new RegExp(
    `Move abort.*?${ADDRESS_PATTERN}::(\\w+)::(\\d+)`,
    "i"
  );
  const abortMatch = vmStatus.match(abortRegex);
  if (abortMatch) {
    return parseMoveAbort(
      normalizeAddress(abortMatch[1]),
      abortMatch[2],
      parseInt(abortMatch[3])
    );
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

  // Check for invalid auth key
  if (vmStatus.includes("INVALID_AUTH_KEY")) {
    return {
      shortCode: "INVALID_AUTH_KEY",
      title: "Invalid Authentication Key",
      description: "The sender address does not match the account's authentication key",
      suggestion:
        "Make sure the sender address is correct and matches your wallet. The address must be derived from your account's public key.",
    };
  }

  // Check for sequence number errors
  if (vmStatus.includes("SEQUENCE_NUMBER_TOO_OLD")) {
    return {
      shortCode: "SEQ_TOO_OLD",
      title: "Sequence Number Too Old",
      description: "The transaction sequence number has already been used",
      suggestion:
        "Fetch the latest sequence number from the account and retry.",
    };
  }

  if (vmStatus.includes("SEQUENCE_NUMBER_TOO_NEW")) {
    return {
      shortCode: "SEQ_TOO_NEW",
      title: "Sequence Number Too New",
      description: "The transaction sequence number is ahead of the account's current sequence",
      suggestion:
        "Wait for pending transactions to complete, or use the correct sequence number.",
    };
  }

  // Check for insufficient balance
  if (vmStatus.includes("INSUFFICIENT_BALANCE") || vmStatus.includes("ECANT_PAY_GAS")) {
    return {
      shortCode: "LOW_BALANCE",
      title: "Insufficient Balance",
      description: "The account does not have enough balance to pay for gas",
      suggestion:
        "Add more MOVE tokens to the sender account to cover gas fees.",
    };
  }

  // Check for module not found
  if (vmStatus.includes("MODULE_NOT_FOUND") || vmStatus.includes("LINKER_ERROR")) {
    return {
      shortCode: "MODULE_NOT_FOUND",
      title: "Module Not Found",
      description: "The specified module does not exist at the given address",
      suggestion:
        "Verify the module address and name are correct. The module may not be deployed on this network.",
    };
  }

  // Check for function not found
  if (vmStatus.includes("FUNCTION_NOT_FOUND")) {
    return {
      shortCode: "FUNC_NOT_FOUND",
      title: "Function Not Found",
      description: "The specified function does not exist in the module",
      suggestion:
        "Check the function name for typos. Make sure the function is public/entry.",
    };
  }

  // Check for type argument mismatch
  if (vmStatus.includes("TYPE_MISMATCH") || vmStatus.includes("NUMBER_OF_TYPE_ARGUMENTS")) {
    return {
      shortCode: "TYPE_ERROR",
      title: "Type Argument Error",
      description: "The type arguments provided do not match the function signature",
      suggestion:
        "Check the number and types of generic type arguments required by the function.",
    };
  }

  // Check for argument errors
  if (vmStatus.includes("NUMBER_OF_ARGUMENTS") || vmStatus.includes("FAILED_TO_DESERIALIZE_ARGUMENT")) {
    return {
      shortCode: "ARG_ERROR",
      title: "Argument Error",
      description: "The arguments provided do not match the function parameters",
      suggestion:
        "Verify the number, order, and types of arguments match the function signature.",
    };
  }

  // Unknown error - but make it more informative
  return {
    shortCode: "ERROR",
    title: "Transaction Failed",
    description: vmStatus,
    suggestion: "Check the raw error message for more details.",
  };
}

function parseMoveFunctionError(fullStatus: string, message: string): ParsedError {
  // Parse "Unexpected prologue Move abort" pattern
  // Handles both 0x1 and full 64-char hex addresses
  const prologueRegex = new RegExp(
    `Unexpected prologue.*?${ADDRESS_PATTERN}::(\\w+)::(\\d+).*?Category:\\s*(\\d+)\\s*Reason:\\s*(\\d+)`,
    "i"
  );
  const prologueMatch = message.match(prologueRegex);

  if (prologueMatch) {
    const [, address, module, , category, reason] = prologueMatch;
    const categoryNum = parseInt(category);
    const reasonNum = parseInt(reason);
    const normalizedAddr = normalizeAddress(address);

    // Get prologue error description
    const prologueDesc =
      PROLOGUE_ERRORS[reasonNum] ||
      `Unknown prologue error (reason: ${reasonNum})`;

    return {
      shortCode: "PROLOGUE_ERROR",
      title: "Prologue Error",
      description: prologueDesc,
      module: `${normalizedAddr}::${module}`,
      category: ABORT_CATEGORIES[categoryNum] || `Category ${categoryNum}`,
      reason: reasonNum,
      suggestion: getSuggestionForPrologueError(reasonNum),
    };
  }

  // Generic move abort in message (handles both address formats)
  const abortRegex = new RegExp(`${ADDRESS_PATTERN}::(\\w+)::(\\d+)`, "i");
  const abortMatch = message.match(abortRegex);
  if (abortMatch) {
    return parseMoveAbort(
      normalizeAddress(abortMatch[1]),
      abortMatch[2],
      parseInt(abortMatch[3])
    );
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
      return "The sender account does not exist on this network. Fund the account with native tokens first using a faucet or transfer.";
    case 3:
      return "The sequence number is too old. Get the latest sequence number from the account";
    case 4:
      return "The sequence number is too new. Wait for pending transactions to complete";
    case 5:
      return "The account doesn't have enough balance to pay for gas. Add more funds.";
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
