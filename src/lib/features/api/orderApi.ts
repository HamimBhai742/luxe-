import { baseApi } from "./baseApi";

export interface DbOrder {
  id: string;
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<{ success: boolean; data: DbOrder[] }, { search?: string } | void>({
      query: (params) => {
        const search = params?.search;
        return {
          url: search ? `/orders?search=${encodeURIComponent(search)}&limit=100` : "/orders",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),
    createOrder: builder.mutation<
      { success: boolean; data: DbOrder },
      {
        customerName: string;
        customerEmail: string;
        total: number;
        paymentStatus?: string;
        fulfillmentStatus?: string;
        paymentMethod?: string;
        deliveryMethod?: string;
        estimatedDelivery?: string;
        items?: Record<string, unknown>[];
      }
    >({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetOrdersQuery, useCreateOrderMutation } = orderApi;
