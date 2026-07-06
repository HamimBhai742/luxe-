import AdminTransactionsClient from "@/components/dashboard/admin/AdminTransactionsClient";

export const metadata = {
  title: "Transactions - Aura Admin",
  description: "View and filter store payment transactions, payouts, and success rates.",
};

export default function AdminTransactionsPage() {
  return <AdminTransactionsClient />;
}
