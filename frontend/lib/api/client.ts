// Client-side API helper that adds wallet address to requests

type FetchOptions = RequestInit & {
  walletAddress?: string | null;
};

export async function apiClient(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { walletAddress, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (walletAddress) {
    requestHeaders["x-wallet-address"] = walletAddress;
  }

  return fetch(url, {
    ...rest,
    headers: requestHeaders,
  });
}

// Helper to create authenticated fetch function
export function createAuthenticatedFetch(walletAddress: string | null) {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    return apiClient(url, { ...options, walletAddress });
  };
}
