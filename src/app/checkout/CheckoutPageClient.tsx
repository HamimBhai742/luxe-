"use client";
import dynamic from "next/dynamic";

const CheckoutClient = dynamic(() => import("@/components/checkout/CheckoutClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold">
      Loading Secure Checkout...
    </div>
  ),
});

export default function CheckoutPageClient() {
  return <CheckoutClient />;
}
