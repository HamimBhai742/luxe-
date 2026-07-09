import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Categories from "@/components/home/Categories";
import FeaturedArrivals from "@/components/home/FeaturedArrivals";
import BrandStory from "@/components/home/BrandStory";
import TrendingNow from "@/components/home/TrendingNow";
import Newsletter from "@/components/home/Newsletter";

const API_URL = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products = [];
  try {
    const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        products = data.data;
      }
    }
  } catch (err) {
    console.error("Error fetching homepage products:", err);
  }

  return (
    <div className="w-full bg-white dark:bg-black">
      <Hero />
      <Features />
      <Categories />
      <FeaturedArrivals products={products} />
      <BrandStory />
      <TrendingNow products={products} />
      <Newsletter />
    </div>
  );
}
