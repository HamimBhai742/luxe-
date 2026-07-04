import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: TUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

// Client-side cookie setter helper
const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax; Secure`;
};

// Client-side cookie deleter helper
const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure`;
};

// Client-side cookie getter helper
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: TUser; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        // 1. Save access token to localStorage with 7-day expiry
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accessTokenExpiry", expiresAt.toString());
        localStorage.setItem("authUser", JSON.stringify(user));

        // 2. Generate a dummy refresh token and set in cookies (expire 30 days)
        // Since server doesn't send a refresh token, we generate a mock client-side refresh token
        const mockRefreshToken = "rt_" + Math.random().toString(36).substring(2, 15);
        setCookie("refreshToken", mockRefreshToken, 30 * 24 * 60 * 60); // 30 days in seconds
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        // Clear localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accessTokenExpiry");
        localStorage.removeItem("authUser");

        // Clear cookies
        deleteCookie("refreshToken");
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("accessToken");
        const storedExpiry = localStorage.getItem("accessTokenExpiry");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedExpiry && storedUser) {
          const expiresAt = parseInt(storedExpiry, 10);
          // Check if token is still within the 7-day validity
          if (Date.now() < expiresAt) {
            state.user = JSON.parse(storedUser);
            state.accessToken = storedToken;
            state.isAuthenticated = true;
            return;
          }
        }
        // If expired or missing, clean up access token from storage,
        // but keep the refreshToken cookie so baseQuery can attempt to refresh it on the first request
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accessTokenExpiry");
        localStorage.removeItem("authUser");
      }
    },
  },
});

export const { setCredentials, clearCredentials, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
