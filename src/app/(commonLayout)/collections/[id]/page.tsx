/* eslint-disable @typescript-eslint/no-explicit-any */
import CollectionDetailsClient from "@/components/collections/CollectionDetailsClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.id; // it's a UUID string or mock number string

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

  let product = null;
  let allProducts: any[] = [];

  try {
    const res = await fetch(`${API_URL}/products/${productId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        product = data.data;
      }
    }
  } catch (err) {
    console.error("Error fetching single product from backend:", err);
  }

  // Fallback to mock data if it looks like a mock ID or fetch failed
  if (!product) {
    const { ALL_PRODUCTS } = await import("@/lib/mockData");
    product = ALL_PRODUCTS.find((p) => String(p.id) === String(productId));
    allProducts = ALL_PRODUCTS;
  } else {
    // If we loaded the product from DB, fetch all products for the "Related Products" list
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          allProducts = data.data;
        }
      }
    } catch (err) {
      console.error("Error fetching all products for details fallback:", err);
    }
  }

  if (!product) {
    notFound();
  }

  // Map database properties to what CollectionDetailsClient expects:
  const mappedProduct = {
    ...product,
    id: product.id,
    colors: product.colors || ["Steel Black", "Silver Link"],
    colorValues: product.colorValues || ["#111", "#ccc"],
    specs: product.specs || {
      Case: "Stainless Steel 42mm",
      Strap: "Genuine Crocodile Leather",
      Waterproof: "10 ATM (100 meters)",
      Origin: "Swiss Made",
    },
    reviews: product.reviews && product.reviews.length > 0
      ? product.reviews.map((r: any) => ({
          author: r.user?.name || "Anonymous",
          rating: r.rating,
          content: r.comment,
          createdAt: r.createdAt,
          images: r.images || [],
        }))
      : [
          { author: "Edward N.", rating: 5, content: "Superb build quality. The leather strap is extremely premium.", createdAt: "2024-10-24T12:00:00Z" },
          { author: "Victoria P.", rating: 4, content: "Very elegant watch. Accurate timekeeping and solid glass finish.", createdAt: "2024-10-23T12:00:00Z" }
        ],
    rating: product.rating || 5.0,
    ratingCount: product.ratingCount || 12,
  };

  const mappedAllProducts = allProducts.map((p: any) => ({
    ...p,
    id: p.id,
    rating: p.rating || 5.0,
    ratingCount: p.ratingCount || 10,
  }));

  return (
    <CollectionDetailsClient key={mappedProduct.id} product={mappedProduct} allProducts={mappedAllProducts} />
  );
}
