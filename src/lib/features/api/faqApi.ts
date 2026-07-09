import { baseApi } from "./baseApi";

export interface TFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<{ success: boolean; data: TFaq[] }, void>({
      query: () => "/faqs",
      providesTags: ["Faq"],
    }),
    createFaq: builder.mutation<
      { success: boolean; message: string; data: TFaq },
      { question: string; answer: string; category: string; order?: number }
    >({
      query: (body) => ({
        url: "/faqs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Faq"],
    }),
    updateFaq: builder.mutation<
      { success: boolean; message: string; data: TFaq },
      { id: string; question: string; answer: string; category: string; order?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/faqs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Faq"],
    }),
    deleteFaq: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faq"],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
