import { INITIAL_CART_ITEMS, RECOMMENDED_PRODUCTS } from "@/lib/mockData";
import CartClient from "@/components/cart/CartClient";

export default function CartPage() {
  return (
    <CartClient
      initialItems={INITIAL_CART_ITEMS}
      recommended={RECOMMENDED_PRODUCTS}
    />
  );
}
