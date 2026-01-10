/**
 * Shinami Gas Station Client for Sentinel
 * Provides gasless transaction sponsorship for user transactions
 *
 * Flow for sponsored transactions:
 * 1. Build feePayer transaction on frontend (with 0x0 placeholder)
 * 2. User signs the transaction FIRST
 * 3. Send signed tx to backend for sponsorship
 * 4. Backend sponsors and submits via Shinami SDK
 */

import {
  AccountAuthenticator,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';

export interface SponsorAndSubmitResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// Cache for sponsorship availability check
let sponsorshipEnabled: boolean | null = null;

/**
 * Custom error class to indicate transaction was submitted but confirmation failed
 * This prevents double submission attempts
 */
export class TransactionSubmittedError extends Error {
  constructor(public hash: string, message: string) {
    super(message);
    this.name = 'TransactionSubmittedError';
  }
}

/**
 * Check if Gas Station sponsorship is available (server-side configured)
 */
export async function isSponsorshipEnabled(): Promise<boolean> {
  if (sponsorshipEnabled !== null) {
    return sponsorshipEnabled;
  }

  try {
    const response = await fetch('/api/shinami/sponsor');
    const data = await response.json();
    sponsorshipEnabled = data.enabled === true;
    return sponsorshipEnabled;
  } catch {
    sponsorshipEnabled = false;
    return false;
  }
}

/**
 * Send signed transaction to backend for sponsorship and submission
 * Returns the transaction hash on success
 */
export async function sponsorAndSubmitTransaction(
  rawTransaction: SimpleTransaction,
  senderAuthenticator: AccountAuthenticator
): Promise<SponsorAndSubmitResult> {
  try {
    // Serialize transaction and authenticator to hex
    const rawTxHex = rawTransaction.bcsToHex().toString();
    const senderAuthenticatorHex = senderAuthenticator.bcsToHex().toString();

    console.log('[Shinami Client] Calling /api/shinami/sponsor...');
    const response = await fetch('/api/shinami/sponsor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawTxHex, senderAuthenticatorHex }),
    });

    console.log('[Shinami Client] Response status:', response.status);
    const result = await response.json();
    console.log('[Shinami Client] Response body:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('[Shinami Client] Response indicates failure:', result.error);
      return {
        success: false,
        error: result.error || 'Sponsorship and submission failed',
      };
    }

    console.log('[Shinami Client] Success! Hash:', result.hash);
    return {
      success: true,
      hash: result.hash,
    };
  } catch (error) {
    console.error('[Shinami Client] Fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sponsorship error',
    };
  }
}

/**
 * Reset the cached sponsorship status (useful for testing)
 */
export function resetSponsorshipCache(): void {
  sponsorshipEnabled = null;
}
