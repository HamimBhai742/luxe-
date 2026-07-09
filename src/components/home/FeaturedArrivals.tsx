/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import ProductCard from "./ProductCard";

interface FeaturedArrivalsProps {
  products: any[];
}

const CARD_GRADIENTS = [
  { from: "from-yellow-100", via: "via-emerald-300/80", to: "to-cyan-400/90" },
  { from: "from-yellow-200/80", via: "via-amber-200/80", to: "to-blue-400/95" },
  { from: "from-teal-100", via: "via-emerald-300/60", to: "to-cyan-400/80" },
  { from: "from-blue-200/70", via: "via-teal-100/70", to: "to-yellow-200/80" },
];

export default function FeaturedArrivals({ products }: FeaturedArrivalsProps) {
  // If backend returns empty, fallback to mock products for design consistency
  const displayProducts = products && products.length > 0
    ? products.slice(0, 4)
    : [
        {
          id: "1",
          name: "Minimalist Chronograph",
          category: "Swiss Movement, Sapphire Crystal",
          price: 450.00,
          status: "Published",
        },
        {
          id: "2",
          name: "Over-Ear ANC Headphones",
          category: "Studio Quality Audio",
          price: 349.00,
          status: "Published",
        },
        {
          id: "3",
          name: "Smart Desk Lamp",
          category: "Adjustable Color Temperature",
          price: 120.00,
          status: "Draft",
        },
        {
          id: "4",
          name: "Premium Sneakers",
          category: "Sustainable Materials",
          price: 135.00,
          status: "Draft",
        },
      ];

  return (
    <section className="py-16 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Featured Arrivals
            </h2>
          </div>
          <Link
            href="/collections"
            className="group flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
          >
            <span>View all</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>

        {/* Grid of Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {displayProducts.map((product, index) => {
            const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
            return (
              <ProductCard
                key={String(product.id)}
                id={String(product.id)}
                name={product.name}
                subtitle={product.category || "Premium Accessories"}
                price={`$${Number(product.price).toFixed(2)}`}
                isNew={product.status === "Published"}
                gradientFrom={gradient.from}
                gradientVia={gradient.via}
                gradientTo={gradient.to}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
