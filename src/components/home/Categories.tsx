import Link from "next/link";
import Image from "next/image";

export default function Categories() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Large Card: Premium Electronics */}
          <Link
            href="/category/electronics"
            className="group relative md:col-span-2 h-[400px] md:h-[480px] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-sm transition-all duration-500 hover:shadow-xl"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/category_electronics.png"
                alt="Premium Electronics category"
                fill
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Premium Electronics
              </h3>
              <div className="mt-2 flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-200 gap-1.5">
                <span>Explore</span>
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
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
              </div>
            </div>
          </Link>

          {/* Right Column with two stacked cards */}
          <div className="flex flex-col gap-6 md:col-span-1 h-[400px] md:h-[480px]">
            {/* Top Card: Minimalist Fashion */}
            <Link
              href="/category/fashion"
              className="group relative flex-1 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-sm transition-all duration-500 hover:shadow-xl"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/category_fashion.png"
                  alt="Minimalist Fashion category"
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Bottom Translucent Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xl bg-white/70 backdrop-blur-md px-4 py-3 dark:bg-black/70">
                <span className="text-xs font-bold tracking-wide text-zinc-900 dark:text-white">
                  Minimalist Fashion
                </span>
              </div>
            </Link>

            {/* Bottom Card: Modern Home */}
            <Link
              href="/category/home"
              className="group relative flex-1 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-sm transition-all duration-500 hover:shadow-xl"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/category_home.png"
                  alt="Modern Home category"
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Bottom Translucent Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xl bg-white/70 backdrop-blur-md px-4 py-3 dark:bg-black/70">
                <span className="text-xs font-bold tracking-wide text-zinc-900 dark:text-white">
                  Modern Home
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
