import Link from "next/link";
import Image from "next/image";

export default function BrandStory() {
  return (
    <section className="py-12 md:py-20 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-sm">
          {/* Left: Mesh Gradient Image */}
          <div className="relative min-h-[320px] md:min-h-[440px] bg-zinc-50 dark:bg-zinc-950">
            <Image
              src="/images/brand_story_gradient.png"
              alt="Brand Story premium mesh gradient"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          {/* Right: Text Information */}
          <div className="flex flex-col justify-center bg-zinc-50/70 p-8 sm:p-12 md:p-16 lg:p-20 dark:bg-zinc-900/30">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Conscious Design. <span className="block">Uncompromising Quality.</span>
            </h2>
            <p className="mt-6 text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              At Aura, we believe true luxury shouldn&apos;t come at the expense of our planet. Our curated collections feature designers who share our commitment to sustainable practices, ethical sourcing, and timeless aesthetics.
            </p>
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-transparent px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              >
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
