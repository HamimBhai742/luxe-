import Header from "@/components/layout/Header";

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
