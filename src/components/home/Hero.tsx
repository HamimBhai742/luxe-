import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-black text-white py-24 md:py-32 lg:py-40">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero_bg.png"
          alt="Abstract futuristic hologram structure"
          fill
          priority
          className="object-cover object-center opacity-65 md:opacity-80"
        />
        {/* Soft dark overlays to ensure readability and sleekness */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-1" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Tag */}
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-blue-400 uppercase ring-1 ring-inset ring-blue-500/20 mb-6">
            New Collection
          </span>

          {/* Heading */}
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Elevate Your <span className="block text-zinc-300">Tech Aesthetic.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base md:text-lg text-zinc-400 leading-relaxed max-w-lg">
            Discover the latest premium electronics designed for minimalist workspaces and high-performance lifestyles.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-300"
            >
              <span>Shop Now</span>
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

            <Link
              href="/collections"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white transition-colors duration-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
