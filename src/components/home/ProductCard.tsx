import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  isNew?: boolean;
  gradientFrom: string;
  gradientTo: string;
  gradientVia?: string;
}

export default function ProductCard({
  id,
  name,
  subtitle,
  price,
  isNew,
  gradientFrom,
  gradientTo,
  gradientVia,
}: ProductCardProps) {
  // Build background style classes based on provided gradients
  const gradientBgStyle = gradientVia
    ? `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`
    : `bg-gradient-to-br ${gradientFrom} ${gradientTo}`;

  return (
    <Link href={`/collections/${id}`} className="group flex flex-col cursor-pointer">
      {/* Image Container with Custom Mesh Gradient */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 mb-4 shadow-sm shadow-zinc-100 dark:shadow-transparent">
        {/* Colorful Mesh Gradient Visualizer */}
        <div className={`absolute inset-0 w-full h-full ${gradientBgStyle} transition-transform duration-500 ease-out group-hover:scale-105`}>
          {/* Glassmorphism overlays to give premium glass/plastic lighting reflection */}
          <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/20 to-transparent pointer-events-none" />
          {/* Internal shadow to give a premium inset look */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
        </div>

        {/* Optional "NEW" Badge */}
        {isNew && (
          <span className="absolute top-4 left-4 z-10 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* Info Container */}
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {name}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1">
          {subtitle}
        </p>
        <p className="mt-2 text-sm font-bold text-zinc-950 dark:text-zinc-50">
          {price}
        </p>
      </div>
    </Link>
  );
}
