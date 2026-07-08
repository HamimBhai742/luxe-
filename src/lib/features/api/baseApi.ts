/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

// Client-side cookie getter helper defined locally to prevent circular imports
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// A simple mutex-like flag to track if refresh token is in progress
let isRefreshing = false;

// Simple sleep helper to wait when a refresh is already in progress
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { accessToken: string | null } };
    const token = state.auth.accessToken || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait if another request is already refreshing the token
  if (isRefreshing) {
    let retries = 0;
    while (isRefreshing && retries < 30) { // max 3 seconds
      await sleep(100);
      retries++;
    }
  }

  let result = await baseQuery(args, api, extraOptions);

  const isRefreshRequest = typeof args === "string"
    ? args.includes("/auth/refresh-token")
    : args.url?.includes("/auth/refresh-token");

  if (result.error && result.error.status === 401 && !isRefreshRequest) {
    const refreshToken = getCookie("refreshToken");

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResult = await baseQuery(
            {
              url: "/auth/refresh-token",
              method: "POST",
              body: { refreshToken },
            },
            api,
            extraOptions
          );

          const responseData = refreshResult.data as {
            success: boolean;
            accessToken: string;
            user?: any;
          } | undefined;

          if (refreshResult.data && responseData?.success && responseData?.accessToken) {
            const currentUser = (api.getState() as { auth: { user: any } }).auth.user;
            
            // Dispatch slice actions using plain action objects to fully decouple baseApi from authSlice
            api.dispatch({
              type: "auth/setCredentials",
              payload: {
                user: responseData.user || currentUser,
                accessToken: responseData.accessToken,
              },
            });

            // Retry the original query
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch({ type: "auth/clearCredentials" });
          }
        } catch (err) {
          console.log(err)
          api.dispatch({ type: "auth/clearCredentials" });
        } finally {
          isRefreshing = false;
        }
      } else {
        // If another request started the refresh while this request was running and failed with 401,
        // wait for that refresh to complete and then retry.
        let retries = 0;
        while (isRefreshing && retries < 30) {
          await sleep(100);
          retries++;
        }
        result = await baseQuery(args, api, extraOptions);
      }
    } else {
      api.dispatch({ type: "auth/clearCredentials" });
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Products", "Wishlist", "Cart", "Orders", "Reviews", "Tickets"],
  endpoints: () => ({}),
});
