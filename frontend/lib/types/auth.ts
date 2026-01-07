export interface AuthUser {
  id: string;
  walletAddress: string;
  name: string | null;
  email: string | null;
  isPrivy: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoaded: boolean;
  isAuthenticated: boolean;
  isPrivyConnected: boolean;
  isNativeConnected: boolean;
  walletAddress: string | null;
  logout: () => Promise<void> | void;
  getAccessToken: () => Promise<string | null>;
}
