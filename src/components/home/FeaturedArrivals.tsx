import Link from "next/link";
import ProductCard from "./ProductCard";

export default function FeaturedArrivals() {
  const products = [
    {
      name: "Minimalist Chronograph",
      subtitle: "Swiss Movement, Sapphire Crystal",
      price: "$450.00",
      isNew: true,
      gradientFrom: "from-yellow-100",
      gradientVia: "via-emerald-300/80",
      gradientTo: "to-cyan-400/90",
    },
    {
      name: "Over-Ear ANC Headphones",
      subtitle: "Studio Quality Audio",
      price: "$349.00",
      isNew: true,
      gradientFrom: "from-yellow-200/80",
      gradientVia: "via-amber-200/80",
      gradientTo: "to-blue-400/95",
    },
    {
      name: "Smart Desk Lamp",
      subtitle: "Adjustable Color Temperature",
      price: "$120.00",
      isNew: false,
      gradientFrom: "from-teal-100",
      gradientVia: "via-emerald-300/60",
      gradientTo: "to-cyan-400/80",
    },
    {
      name: "Premium Sneakers",
      subtitle: "Sustainable Materials",
      price: "$135.00",
      isNew: false,
      gradientFrom: "from-blue-200/70",
      gradientVia: "via-teal-100/70",
      gradientTo: "to-yellow-200/80",
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
            href="/new-arrivals"
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
          {products.map((product, index) => (
            <ProductCard
              key={index}
              name={product.name}
              subtitle={product.subtitle}
              price={product.price}
              isNew={product.isNew}
              gradientFrom={product.gradientFrom}
              gradientVia={product.gradientVia}
              gradientTo={product.gradientTo}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
