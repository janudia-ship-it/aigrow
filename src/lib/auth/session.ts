import { cookies } from "next/headers";
import type { AuthResponse, UserProfile } from "@/features/auth/types/auth.types";

export const ACCESS_TOKEN_COOKIE = "aigrow_access_token";
export const REFRESH_TOKEN_COOKIE = "aigrow_refresh_token";
export const USER_PROFILE_COOKIE = "aigrow_user_profile";

export async function setAuthSession(auth: AuthResponse, rememberMe: boolean = false) {
  const cookieStore = await cookies();

  // If rememberMe is true, use the 7-day refresh token lifespan for persistent session
  const maxAge = rememberMe ? 60 * 60 * 24 * 7 : undefined;

  cookieStore.set(ACCESS_TOKEN_COOKIE, auth.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge ?? 60 * 15, // 15 mins default
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, auth.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set(USER_PROFILE_COOKIE, JSON.stringify(auth.user), {
    httpOnly: false, // accessible to display user details in client UI
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge ?? 60 * 60 * 24 * 7,
  });
}

export async function getAuthSession(): Promise<{
  accessToken: string | null;
  user: UserProfile | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
  const userJson = cookieStore.get(USER_PROFILE_COOKIE)?.value;

  let user: UserProfile | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  return { accessToken: token, user };
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_PROFILE_COOKIE);
}

