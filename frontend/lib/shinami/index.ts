/**
 * Shinami Integration Module for Sentinel
 * Provides Gas Station sponsorship for gasless transactions
 */

export {
  isSponsorshipEnabled,
  sponsorAndSubmitTransaction,
  resetSponsorshipCache,
  TransactionSubmittedError,
  type SponsorAndSubmitResult,
} from './client';
