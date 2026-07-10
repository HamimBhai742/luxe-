import { Suspense } from "react";
import AdminProductsClient from "@/components/dashboard/admin/AdminProductsClient";

export default function AdminProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold">
        Loading Products Console...
      </div>
    }>
      <AdminProductsClient />
    </Suspense>
  );
}
