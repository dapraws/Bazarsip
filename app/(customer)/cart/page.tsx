"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
};

type CartStoredItem = {
  productId: number;
  quantity: number;
};

type CartItem = CartStoredItem & {
  product?: Product; // optional karena bisa gagal fetch
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    setLoading(true);

    let cartData: CartStoredItem[] = [];
    try {
      cartData = JSON.parse(
        localStorage.getItem("cart") ?? "[]",
      ) as CartStoredItem[];
    } catch {
      cartData = [];
    }

    try {
      const cartWithProducts: CartItem[] = await Promise.all(
        cartData.map(async (item) => {
          try {
            const res = await fetch(`/api/products/${item.productId}`, {
              cache: "no-store",
            });

            if (!res.ok) {
              // kalau 404/500, tetap balikin item tanpa product
              return { ...item, product: undefined };
            }

            const data: { data?: Product } = await res.json();
            return { ...item, product: data.data };
          } catch {
            return { ...item, product: undefined };
          }
        }),
      );

      setCart(cartWithProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const persistCart = (updated: CartItem[]) => {
    localStorage.setItem(
      "cart",
      JSON.stringify(
        updated.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      ),
    );
  };

  function updateQuantity(productId: number, newQuantity: number) {
    if (newQuantity < 1) return;

    setCart((prev) => {
      const updated = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      );
      persistCart(updated);
      return updated;
    });
  }

  function removeItem(productId: number) {
    setCart((prev) => {
      const updated = prev.filter((item) => item.productId !== productId);
      persistCart(updated);
      return updated;
    });
  }

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
      0,
    );
  }, [cart]);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link
            href="/shop"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl shadow-sm border p-6 flex items-center space-x-4"
              >
                <Image
                  src={item.product?.image_url ?? "/placeholder.png"}
                  alt={item.product?.name ?? "Product"}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg"
                  unoptimized
                />

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {item.product?.name ?? "Product unavailable"}
                  </h3>
                  <p className="text-gray-600">
                    Rp {(item.product?.price ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    Rp{" "}
                    {(
                      (item.product?.price ?? 0) * item.quantity
                    ).toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 text-sm mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>Rp {tax.toLocaleString("id-ID")}</span>
                </div>
                <div className="pt-4 border-t flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
