import { Suspense } from "react";
import AdminBrandsClient from "@/components/dashboard/admin/AdminBrandsClient";

export default function AdminBrandsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold">
        Loading Brands Console...
      </div>
    }>
      <AdminBrandsClient />
    </Suspense>
  );
}
