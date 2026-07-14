import { Suspense } from "react";
import CheckoutPageClient from "./CheckoutPageClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold">
        Loading Secure Checkout...
      </div>
    }>
      <CheckoutPageClient />
    </Suspense>
  );
}
