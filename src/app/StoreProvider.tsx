/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { makeStore, AppStore } from "../lib/store";
import { initializeAuth } from "../lib/features/auth/authSlice";
import { initializeCart, setCartItems } from "../lib/features/cart/cartSlice";
import { useAppSelector } from "../lib/hooks";
import { useGetDbCartQuery } from "../lib/features/api/cartApi";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeCart());
  }, [dispatch]);

  const { data: dbCartData } = useGetDbCartQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (dbCartData?.success && dbCartData.data) {
      const mapped = dbCartData.data.map((item: any) => ({
        id: item.productId,
        productId: String(item.productId),
        name: item.product.name,
        brand: item.product.brand || "LUXE",
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
        specsText: item.specsText || "",
      }));
      dispatch(setCartItems(mapped));
    }
  }, [dbCartData, dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
