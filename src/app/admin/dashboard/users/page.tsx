import { Suspense } from "react";
import AdminUsersClient from "@/components/dashboard/admin/AdminUsersClient";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold">
        Loading Users Console...
      </div>
    }>
      <AdminUsersClient />
    </Suspense>
  );
}
