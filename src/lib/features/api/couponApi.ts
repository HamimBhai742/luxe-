import { baseApi } from "./baseApi";

export interface DbCoupon {
  id: string;
  code: string;
  type: "Percentage" | "Fixed Amount" | "Free Shipping";
  value: string;
}

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation<{ success: boolean; message: string; data: DbCoupon }, { code: string }>({
      query: (body) => ({
        url: "/coupons/validate",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useValidateCouponMutation } = couponApi;
