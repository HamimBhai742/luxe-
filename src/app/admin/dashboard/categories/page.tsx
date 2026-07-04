import { Suspense } from "react";
import AdminCategoriesClient from "@/components/dashboard/admin/AdminCategoriesClient";

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold">
        Loading Categories Console...
      </div>
    }>
      <AdminCategoriesClient />
    </Suspense>
  );
}
