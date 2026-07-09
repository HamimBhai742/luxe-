import { baseApi } from "./baseApi";

export interface TUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  location: string;
  username: string;
  website: string;
  twitter: string;
  workspaceStyle: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<{ success: boolean; data: TUserProfile }, void>({
      query: () => "/users/profile",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<
      { success: boolean; message: string; data: TUserProfile },
      Partial<TUserProfile>
    >({
      query: (body) => ({
        url: "/users/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<
      { success: boolean; message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/users/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = userApi;
export default userApi;
