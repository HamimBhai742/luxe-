import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, INITIAL_CART_ITEMS } from "@/lib/mockData";

interface CartState {
  items: CartItem[];
  isInitialized: boolean;
}

const initialState: CartState = {
  items: [],
  isInitialized: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initializeCart: (state) => {
      if (typeof window !== "undefined") {
        const storedCart = localStorage.getItem("cartItems");
        if (storedCart) {
          try {
            state.items = JSON.parse(storedCart);
          } catch (e) {
            console.error("Failed to parse cart items from localStorage", e);
            state.items = INITIAL_CART_ITEMS;
          }
        } else {
          // Default to the mock items on first visit, and save them to local storage
          state.items = INITIAL_CART_ITEMS;
          localStorage.setItem("cartItems", JSON.stringify(INITIAL_CART_ITEMS));
        }
        state.isInitialized = true;
      }
    },
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) => {
      const { id, productId, name, brand, price, image, specsText, quantity = 1 } = action.payload;
      const existing = state.items.find(
        (item) => item.id === id || (item.name === name && item.specsText === specsText)
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          id,
          productId: productId || String(id),
          name,
          brand,
          price,
          image,
          quantity,
          specsText: specsText || "Default Edition • Premium Grade",
        });
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },
    updateQuantity: (state, action: PayloadAction<{ id: string | number; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => String(i.id) === String(id));
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action: PayloadAction<{ id: string | number }>) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload.id));
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },
  },
});

export const { initializeCart, addToCart, updateQuantity, removeFromCart, clearCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
