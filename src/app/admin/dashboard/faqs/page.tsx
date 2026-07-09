import { Suspense } from "react";
import AdminFaqsClient from "@/components/dashboard/admin/AdminFaqsClient";

export const metadata = {
  title: "FAQ Management | Aura Admin",
  description: "Create, read, update, and delete store FAQs dynamically.",
};

export default function AdminFaqsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-zinc-550 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest animate-pulse">
          Loading FAQs Console...
        </div>
      }
    >
      <AdminFaqsClient />
    </Suspense>
  );
}
