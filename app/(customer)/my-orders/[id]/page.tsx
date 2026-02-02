"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/my-orders" className="text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[order.status]}`}
            >
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Payment Status</p>
              <p className="font-medium">{order.payment_status}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold mb-2">Shipping Address</h2>
            <p className="text-gray-600">
              {order.shipping_address || "No address provided"}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 border-b pb-4"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      Rp{" "}
                      {(parseFloat(item.price) * item.quantity).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>Rp {parseFloat(order.total).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
