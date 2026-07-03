import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Categories from "@/components/home/Categories";
import FeaturedArrivals from "@/components/home/FeaturedArrivals";
import BrandStory from "@/components/home/BrandStory";
import TrendingNow from "@/components/home/TrendingNow";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <div className="w-full bg-white dark:bg-black">
      <Hero />
      <Features />
      <Categories />
      <FeaturedArrivals />
      <BrandStory />
      <TrendingNow />
      <Newsletter />
    </div>
  );
}
