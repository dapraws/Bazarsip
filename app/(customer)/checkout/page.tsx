"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: "",
    notes: "",
  });

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartWithProducts = await Promise.all(
      cartData.map(async (item: any) => {
        const res = await fetch(`/api/products/${item.productId}`);
        const data = await res.json();
        return { ...item, product: data.data };
      }),
    );
    setCart(cartWithProducts);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = 1; // TODO: Get from JWT session

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          items: cart.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
          shipping_address: formData.shipping_address,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("cart");
        alert("Order placed successfully!");
        router.push(`/my-orders/${data.data.orderId}`);
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleCheckout} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Shipping Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address *
              </label>
              <textarea
                value={formData.shipping_address}
                onChange={(e) =>
                  setFormData({ ...formData, shipping_address: e.target.value })
                }
                rows={4}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your complete address"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special instructions?"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900 font-medium">
                    Rp{" "}
                    {(
                      (item.product?.price || 0) * item.quantity
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
