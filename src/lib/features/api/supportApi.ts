import { baseApi } from "./baseApi";

export interface SupportTicket {
  id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: "Open" | "In-Progress" | "Resolved";
  createdAt: string;
  updatedAt: string;
}

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<{ success: boolean; data: SupportTicket[] }, void>({
      query: () => "/support",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Tickets" as const, id })),
              { type: "Tickets", id: "LIST" },
            ]
          : [{ type: "Tickets", id: "LIST" }],
    }),
    createTicket: builder.mutation<{ success: boolean; data: SupportTicket }, { subject: string; description: string }>({
      query: (body) => ({
        url: "/support",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tickets", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
} = supportApi;
