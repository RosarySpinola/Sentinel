"use client";

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName,
        imageUrl: user.imageUrl,
      }
    : null;

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const token = await getToken();
      return token;
    } catch {
      return null;
    }
  };

  return {
    user: authUser,
    isLoaded,
    isAuthenticated: isSignedIn,
    getAccessToken,
    signOut,
  };
}
