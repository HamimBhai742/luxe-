/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useRouter } from "next/navigation";
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/lib/features/api/wishlistApi";
import { useSyncDbCartMutation } from "@/lib/features/api/cartApi";
import { useCheckReviewEligibilityQuery, useSubmitReviewMutation } from "@/lib/features/api/reviewApi";

interface ProductReview {
  author: string;
  rating: number;
  content: string;
  createdAt?: string;
  images?: string[];
  isVerifiedBuyer?: boolean;
}

interface ProductSpecs {
  [key: string]: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  isNew: boolean;
  tag: string;
  image: string;
  inStock: boolean;
  description: string;
  images: string[];
  colors: string[];
  colorValues: string[];
  specs: ProductSpecs;
  reviewSummary?: string;
  reviews: ProductReview[];
}

interface CollectionDetailsClientProps {
  product: Product;
  allProducts: Product[];
}

export default function CollectionDetailsClient({
  product,
  allProducts,
}: CollectionDetailsClientProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [syncDbCart] = useSyncDbCartMutation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [localIsFavorite, setLocalIsFavorite] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("shop");

  const [reviewsList, setReviewsList] = useState<ProductReview[]>(product.reviews);
  const [currentRating, setCurrentRating] = useState<number>(product.rating);
  const [currentRatingCount, setCurrentRatingCount] = useState<number>(product.ratingCount);

  const { data: eligibilityData, refetch: refetchEligibility } = useCheckReviewEligibilityQuery(
    String(product.id),
    { skip: !isAuthenticated }
  );
  const isEligible = eligibilityData?.success && eligibilityData.eligible;

  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();

  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    const toastId = toast.loading("Submitting your review...");
    try {
      let uploadedImages: string[] = [];

      if (selectedFile) {
        toast.loading("Uploading review image...", { id: toastId });
        const base64Image = await fileToBase64(selectedFile);
        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
        
        const uploadRes = await fetch(`${baseUrl}/upload/image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Failed to upload review image.");
        }
        uploadedImages = [uploadData.url];
      }

      toast.loading("Saving review...", { id: toastId });
      const res = await submitReview({
        productId: String(product.id),
        rating: ratingInput,
        comment: commentInput.trim(),
        images: uploadedImages,
      }).unwrap();

      if (res.success) {
        toast.success("Review submitted successfully!", { id: toastId });
        
        const newReviewObj: ProductReview = {
          author: user?.name || "You",
          rating: ratingInput,
          content: commentInput.trim(),
          createdAt: new Date().toISOString(),
          images: uploadedImages,
          isVerifiedBuyer: true,
        };
        const updatedReviews = [newReviewObj, ...reviewsList];
        setReviewsList(updatedReviews);
        
        const newCount = reviewsList.length + 1;
        const newAvgRating = parseFloat(
          ((reviewsList.reduce((sum, r) => sum + r.rating, 0) + ratingInput) / newCount).toFixed(1)
        );
        setCurrentRating(newAvgRating);
        setCurrentRatingCount(newCount);
        
        setCommentInput("");
        setRatingInput(5);
        setSelectedFile(null);
        setFilePreview(null);
        refetchEligibility();
        router.refresh();
      }
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      toast.error(err?.message || err?.data?.message || "Failed to submit review. Please try again.", { id: toastId });
    }
  };

  const wishlist = wishlistData?.success && wishlistData.data ? wishlistData.data : [];
  const isProductInWishlist = isAuthenticated 
    ? wishlist.some((item) => String(item.id) === String(product.id))
    : false;
  const isFavorite = isAuthenticated ? isProductInWishlist : localIsFavorite;

  // Scroll to top and track recently viewed product on load
  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      try {
        const storedStr = localStorage.getItem("recentlyViewed");
        let list: any[] = [];
        if (storedStr) {
          list = JSON.parse(storedStr);
        }
        
        // Remove product if already present to bring it to the front
        list = list.filter((item: any) => String(item.id) !== String(product.id));
        
        // Add to front of the list
        list.unshift({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image
        });
        
        // Keep only top 4 recently viewed items
        list = list.slice(0, 4);
        
        localStorage.setItem("recentlyViewed", JSON.stringify(list));
      } catch (err) {
        console.error("Error storing recently viewed product:", err);
      }
    }
  }, [product.id, product]);

  const handleAddToCart = async () => {
    const specsText = selectedColor ? `${selectedColor} • Premium Grade` : "Default Edition • Premium Grade";
    dispatch(
      addToCart({
        id: product.id,
        productId: String(product.id),
        name: product.name,
        brand: product.brand || "LUXE",
        price: product.price,
        image: product.image,
        specsText,
      })
    );
    toast.success(`Added ${product.name} to cart!`);

    if (isAuthenticated) {
      try {
        await syncDbCart({
          items: [{ productId: String(product.id), quantity: 1, specsText }],
        }).unwrap();
      } catch (err) {
        console.error("Failed to sync item addition to DB cart:", err);
      }
    }
  };

  const handleBuyNow = async () => {
    const specsText = selectedColor ? `${selectedColor} • Premium Grade` : "Default Edition • Premium Grade";
    dispatch(
      addToCart({
        id: product.id,
        productId: String(product.id),
        name: product.name,
        brand: product.brand || "LUXE",
        price: product.price,
        image: product.image,
        specsText,
      })
    );

    if (isAuthenticated) {
      try {
        await syncDbCart({
          items: [{ productId: String(product.id), quantity: 1, specsText }],
        }).unwrap();
      } catch (err) {
        console.error("Failed to sync buy now item to DB cart:", err);
      }
    }
    router.push("/checkout");
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      localStorage.setItem("pendingWishlistAdd", String(product.id));
      toast.info("Please log in to add items to your wishlist.");
      router.push("/sign-in");
      return;
    }

    try {
      if (isProductInWishlist) {
        await removeFromWishlist({ productId: String(product.id) }).unwrap();
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist({ productId: String(product.id) }).unwrap();
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  // Generate related products (excluding current one)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Dynamic breadcrumbs based on category
  const renderBreadcrumbs = () => {
    if (product.category === "Laptops") {
      return (
        <nav className="mb-6 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
          <Link href="/" className="hover:text-zinc-600 transition-colors">Electronics</Link>
          <span className="mx-2 text-zinc-300">&gt;</span>
          <span className="hover:text-zinc-600 transition-colors">Computers</span>
          <span className="mx-2 text-zinc-300">&gt;</span>
          <span className="hover:text-zinc-600 transition-colors">Laptops</span>
          <span className="mx-2 text-zinc-300">&gt;</span>
          <span className="text-zinc-900 dark:text-zinc-100">{product.name}</span>
        </nav>
      );
    }

    return (
      <nav className="mb-6 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
        <Link href="/collections" className="hover:text-zinc-600 transition-colors">Collections</Link>
        <span className="mx-2 text-zinc-300">&gt;</span>
        <span className="hover:text-zinc-600 transition-colors">{product.category}</span>
        <span className="mx-2 text-zinc-300">&gt;</span>
        <span className="text-zinc-900 dark:text-zinc-100">{product.name}</span>
      </nav>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors duration-300 min-h-screen pb-24 md:pb-16">
      
      {/* ========================================================================= */}
      {/* DESKTOP/TABLET DETAILS LAYOUT */}
      {/* ========================================================================= */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Product Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          
          {/* LEFT: Image Gallery */}
          <div className="space-y-6">
            
            {/* Main Showcase Image */}
            <div className="relative aspect-4/3 w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center p-4">
              <Image
                src={product.images[activeImageIndex] || product.image}
                alt={product.name}
                width={400}
                height={300}
                className="object-contain max-h-[85%] max-w-[85%] transition-all duration-300"
              />

              {/* Tag Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.originalPrice && product.price < product.originalPrice && (
                  <span className="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                    SAVE ৳{product.originalPrice - product.price}
                  </span>
                )}
                {product.tag && (
                  <span className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm ${
                    product.tag === "NEW" ? "bg-blue-600" : "bg-blue-700"
                  }`}>
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Zoom Button */}
              <button className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 shadow-md border border-zinc-100 dark:border-zinc-700 transition-colors cursor-pointer">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </button>
            </div>

            {/* Thumbnails strip */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => {
                const isActive = index === activeImageIndex;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-900 border overflow-hidden p-2 flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                    }`}
                  >
                    <Image src={img} alt="thumbnail" width={80} height={80} className="object-contain max-h-[90%] max-w-[90%]" />
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT: Product Buy Panel */}
          <div className="space-y-6">
            
            {/* Header info */}
            <div>
              <span className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                {product.brand}
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {product.name}
              </h1>

              {/* Rating stars */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4.5 w-4.5 ${i < Math.floor(currentRating) ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800"}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  ({currentRatingCount} reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-base text-zinc-400 dark:text-zinc-500 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Colors picker */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">
                  Color: <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{selectedColor}</span>
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => {
                    const isSelected = color === selectedColor;
                    const value = product.colorValues[index] || "#ccc";
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`h-9 w-9 rounded-full border-2 flex items-center justify-center shadow-sm cursor-pointer ${
                          isSelected ? "border-blue-600 scale-105" : "border-zinc-200 dark:border-zinc-800 hover:scale-103"
                        }`}
                        style={{ backgroundColor: value }}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={handleAddToCart}
                className="flex-1 border-2 border-blue-600 bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl py-3 text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* Shipping Info */}
            <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.66l1.049-2.223a.75.75 0 00.07-.312V5.58c0-.98.79-1.78 1.78-1.78h10.375c.99 0 1.78.8 1.78 1.78v8.622a.75.75 0 00.07.312l1.049 2.222a1.125 1.125 0 01-1.02 1.66H17.25m-11.25 0a1.5 1.5 0 00-3 0m3 0a1.5 1.5 0 01-3 0m11.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-1.5-12.75h.007v.008H12v-.008z" />
              </svg>
              <span>Free shipping on orders over ৳5,000</span>
            </div>

          </div>

        </div>

        {/* Overview Tab Content */}
        <div className="mb-16 border-t border-zinc-100 dark:border-zinc-800 pt-8">
          <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-4">Overview</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>

        {/* Specs & Reviews Side-by-Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-zinc-100 dark:border-zinc-800 pt-12 mb-16">
          
          {/* Specifications Table */}
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-6">Product Specifications</h2>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-855 text-sm font-medium">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="w-1/3 px-6 py-4 font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/20">{key}</td>
                      <td className="px-6 py-4 text-zinc-900 dark:text-zinc-200">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-6">Customer Reviews</h2>
            
            {/* AI Summary Block */}
            {product.reviewSummary && (
              <div className="rounded-2xl border border-blue-100/50 bg-blue-50/20 dark:border-blue-900/30 dark:bg-blue-950/10 p-5 mb-6 shadow-xs">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-xs tracking-wider uppercase mb-2.5">
                  {/* AI Stars/Sparkle icon */}
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3.096 15.09 8.19 14.28 9 9.18l.813 5.096 5.096.813-5.096.814zM19.07 7.07l-.357 2.237-.238-1.5-1.5-.238 2.237-.357.357-2.237.238 1.5 1.5.238-2.237.357z" />
                  </svg>
                  <span>AI Review Summary</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic font-medium">
                  &ldquo;{product.reviewSummary}&rdquo;
                </p>
              </div>
            )}

            {/* Write a Review Block (If Eligible) */}
            {isEligible && (
              <form onSubmit={handleReviewSubmit} className="mb-8 p-6 rounded-2xl border border-zinc-100 bg-zinc-50/30 dark:border-zinc-800/80 dark:bg-zinc-900/20 shadow-xs backdrop-blur-xs">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">Write a Review</h3>
                
                {/* Star rating picker */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starVal = i + 1;
                      const isHighlighted = hoveredRating !== null ? starVal <= hoveredRating : starVal <= ratingInput;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setRatingInput(starVal)}
                          onMouseEnter={() => setHoveredRating(starVal)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="text-amber-400 hover:scale-110 transition-all duration-150 cursor-pointer focus:outline-none"
                        >
                          <svg
                            className={`h-7 w-7 ${isHighlighted ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800"}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      );
                    })}
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 ml-2">
                      {hoveredRating !== null ? `${hoveredRating} Star${hoveredRating > 1 ? 's' : ''}` : `${ratingInput} Star${ratingInput > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* Review comment input */}
                <div className="mb-4">
                  <label htmlFor="comment-text" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Review Details</label>
                  <textarea
                    id="comment-text"
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-medium"
                    required
                  />
                </div>

                {/* Image upload field */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Review Image (Optional)</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      id="product-review-image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFilePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-review-image"
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span>Choose Image</span>
                    </label>

                    {filePreview && (
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <Image src={filePreview} alt="Review preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreview(null);
                          }}
                          className="absolute top-1 right-1 bg-zinc-900/80 hover:bg-zinc-900 rounded-full p-0.5 text-white transition-all cursor-pointer"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-6 py-3 text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </form>
            )}

            {/* List of Reviews */}
            <div className="space-y-4">
              {reviewsList.map((rev, index) => (
                <div key={index} className="pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">{rev.author}</span>
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50/80 dark:bg-blue-950/40 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20 uppercase tracking-wide">
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Verified Buyer
                          </span>
                        )}
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`h-3 w-3 ${i < rev.rating ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800"}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {rev.createdAt && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">{rev.content}</p>
                  
                  {/* Uploaded images display */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-3">
                      {rev.images.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                          <Image
                            src={imgUrl}
                            alt={`Review asset ${imgIdx + 1}`}
                            fill
                            className="object-cover cursor-zoom-in hover:scale-105 transition-all duration-300"
                            onClick={() => window.open(imgUrl, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS SECTION */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-12">
          <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-6">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/collections/${p.id}`}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-square w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden p-4 flex items-center justify-center">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={180}
                    height={180}
                    className="object-contain max-h-[85%] max-w-[85%] transition-transform duration-500 ease-out group-hover:scale-103"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">{p.brand}</span>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5 group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 block mt-3">৳{p.price.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE DEVICE DETAILS LAYOUT */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col min-h-screen relative bg-white dark:bg-black">
        
        {/* Mobile Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-black/95 px-4 backdrop-blur-md">
          <Link href="/collections" className="text-zinc-700 dark:text-zinc-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <span className="text-sm font-extrabold tracking-wide text-zinc-900 dark:text-white font-serif uppercase">
            Aura Marketplace
          </span>
          <div className="flex gap-3">
            <button onClick={toggleFavorite} className="text-zinc-700 dark:text-zinc-300">
              <svg className={`h-6 w-6 ${isFavorite ? "fill-red-500 stroke-red-500" : "stroke-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            <button onClick={() => toast.success("Link copied to clipboard!")} className="text-zinc-700 dark:text-zinc-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Page Content Spacer */}
        <div className="h-14" />

        {/* Carousel Showcase */}
        <div className="relative w-full aspect-square bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 border-b border-zinc-100 dark:border-zinc-900">
          <Image
            src={product.images[activeImageIndex] || product.image}
            alt={product.name}
            width={300}
            height={300}
            className="object-contain max-h-[85%] max-w-[85%]"
          />
          
          {/* Tag Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product.originalPrice && product.price < product.originalPrice && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                SAVE ৳{product.originalPrice - product.price}
              </span>
            )}
            {product.tag && (
              <span className="rounded bg-blue-600 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                {product.tag}
              </span>
            )}
          </div>

          {/* Slider dots */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors cursor-pointer ${
                  i === activeImageIndex ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product Title and Price Info */}
        <div className="p-4 bg-white dark:bg-zinc-900/50">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                {product.brand}
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 block">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-400 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="mt-2.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
            <div className="flex text-amber-450">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.floor(currentRating) ? "fill-amber-450" : "fill-zinc-200 dark:fill-zinc-800"}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span>{currentRating} ({currentRatingCount} reviews)</span>
          </div>
        </div>

        {/* Mobile Color Picker */}
        {product.colors.length > 0 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-900/50">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
              Color: <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{selectedColor}</span>
            </h3>
            <div className="flex gap-3">
              {product.colors.map((color, index) => {
                const isSelected = color === selectedColor;
                const value = product.colorValues[index] || "#ccc";
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shadow-xs cursor-pointer ${
                      isSelected ? "border-blue-600 scale-105" : "border-zinc-200 dark:border-zinc-800"
                    }`}
                    style={{ backgroundColor: value }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Description */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-900/50">
          <h3 className="text-xs font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-2.5">Overview</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>

        {/* Key Specs Card Grid */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20">
          <h3 className="text-xs font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-3">Key Specifications</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(product.specs).map(([key, value]) => {
              // Custom Spec icons
              const renderSpecIcon = (specKey: string) => {
                const sKey = specKey.toLowerCase();
                if (sKey.includes("processor") || sKey.includes("movement")) {
                  return (
                    <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                    </svg>
                  );
                }
                if (sKey.includes("memory") || sKey.includes("power")) {
                  return (
                    <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  );
                }
                if (sKey.includes("storage") || sKey.includes("dimensions")) {
                  return (
                    <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25m2.25-2.25l2.25-2.25M3.75 7.5L5.621 3.757A1.5 1.5 0 016.964 3h10.071a1.5 1.5 0 011.343.803L20.25 7.5m-16.5 0H20.25" />
                    </svg>
                  );
                }
                // default display / material
                return (
                  <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                );
              };

              return (
                <div key={key} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{key}</span>
                    {renderSpecIcon(key)}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight block">{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Sticky Add to Bag / Buy Now CTAs */}
        <div className="fixed bottom-14 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 flex gap-3 backdrop-blur-md">
          <button
            onClick={handleAddToCart}
            className="flex-1 border-2 border-blue-600 bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl py-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Add to Bag
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            Buy Now
          </button>
        </div>

        {/* Mobile Bottom Navigation Bar (Fixed bottom dock) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 border-t border-zinc-200 dark:border-zinc-800 px-6 py-2 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <Link
              href="/"
              onClick={() => setActiveMobileTab("home")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeMobileTab === "home" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
              }`}
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-[9px] font-bold tracking-wider uppercase">Shop</span>
            </Link>

            <button
              onClick={() => {
                setActiveMobileTab("bag");
                toast.info("Cart view coming soon!");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeMobileTab === "bag" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
              }`}
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
              </svg>
              <span className="text-[9px] font-bold tracking-wider uppercase">Bag</span>
            </button>

            <button
              onClick={() => {
                setActiveMobileTab("orders");
                toast.info("Order history coming soon!");
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeMobileTab === "orders" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
              }`}
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-[9px] font-bold tracking-wider uppercase">Orders</span>
            </button>

            <Link
              href="/dashboard"
              onClick={() => setActiveMobileTab("profile")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeMobileTab === "profile" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
              }`}
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[9px] font-bold tracking-wider uppercase">Account</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
