import ProductCard from "./ProductCard";

export default function TrendingNow() {
  const products = [
    {
      name: "MacBook Pro Sleeve",
      subtitle: "Full-Grain Leather, Wool Felt Lining",
      price: "$85.00",
      isNew: false,
      gradientFrom: "from-amber-900/80",
      gradientVia: "via-yellow-700/80",
      gradientTo: "to-orange-500/90",
    },
    {
      name: "Noise Cancelling Earbuds",
      subtitle: "Active Noise Cancelling, 30h Battery Life",
      price: "$249.00",
      isNew: false,
      gradientFrom: "from-zinc-400/90",
      gradientVia: "via-neutral-300/80",
      gradientTo: "to-zinc-500/95",
    },
    {
      name: "Ceramic Pour-Over",
      subtitle: "Slow Drip, Heat-Resistant Matte Finish",
      price: "$65.00",
      isNew: false,
      gradientFrom: "from-orange-400/90",
      gradientVia: "via-amber-300/85",
      gradientTo: "to-yellow-200/80",
    },
    {
      name: "Ergonomic Office Chair",
      subtitle: "Dynamic Lumbar Support, Breathable Mesh",
      price: "$890.00",
      isNew: false,
      gradientFrom: "from-cyan-400/80",
      gradientVia: "via-teal-200/70",
      gradientTo: "to-orange-300/80",
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
