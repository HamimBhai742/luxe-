import { Suspense } from "react";
import AdminOrdersClient from "@/components/dashboard/admin/AdminOrdersClient";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold">
        Loading Orders Console...
      </div>
    }>
      <AdminOrdersClient />
    </Suspense>
  );
}
