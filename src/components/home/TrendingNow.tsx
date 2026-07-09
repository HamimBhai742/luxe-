/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductCard from "./ProductCard";

interface TrendingNowProps {
  products: any[];
}

const CARD_GRADIENTS = [
  { from: "from-amber-900/80", via: "via-yellow-700/80", to: "to-orange-500/90" },
  { from: "from-zinc-400/90", via: "via-neutral-300/80", to: "to-zinc-500/95" },
  { from: "from-orange-400/90", via: "via-amber-300/85", to: "to-yellow-200/80" },
  { from: "from-cyan-400/80", via: "via-teal-200/70", to: "to-orange-300/80" },
];

export default function TrendingNow({ products }: TrendingNowProps) {
  // If backend returns empty, fallback to mock products for design consistency
  const displayProducts = products && products.length > 0
    ? (products.length > 4 ? products.slice(4, 8) : products.slice(0, 4))
    : [
        {
          id: "5",
          name: "MacBook Pro Sleeve",
          category: "Full-Grain Leather, Wool Felt Lining",
          price: 85.00,
          status: "Draft",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "6",
          name: "Noise Cancelling Earbuds",
          category: "Active Noise Cancelling, 30h Battery Life",
          price: 249.00,
          status: "Draft",
          image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "7",
          name: "Ceramic Pour-Over",
          category: "Slow Drip, Heat-Resistant Matte Finish",
          price: 65.00,
          status: "Draft",
          image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
        },
        {
          id: "8",
          name: "Ergonomic Office Chair",
          category: "Dynamic Lumbar Support, Breathable Mesh",
          price: 890.00,
          status: "Draft",
          image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600&auto=format&fit=crop",
        },
      ];

  return (
    <section className="py-16 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Trending Now
          </h2>
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
                subtitle={product.category || "Premium Workspaces"}
                price={`$${Number(product.price).toFixed(2)}`}
                image={product.image}
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
