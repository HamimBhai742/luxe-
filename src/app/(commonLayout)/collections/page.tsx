import CollectionsClient from "@/components/collections/CollectionsClient";
import { ALL_PRODUCTS } from "@/lib/mockData";
import { Suspense } from "react";

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CollectionsClient products={ALL_PRODUCTS} />
    </Suspense>
  );
}
