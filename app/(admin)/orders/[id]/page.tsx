"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  async function updateOrderStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert("Status pesanan diperbarui");
        fetchOrder();
      } else {
        alert("Gagal memperbarui status pesanan");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Gagal memperbarui pesanan");
    } finally {
      setUpdating(false);
    }
  }

  async function updatePaymentStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      if (res.ok) {
        alert("Status pembayaran diperbarui");
        fetchOrder();
      } else {
        alert("Gagal memperbarui status pembayaran");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Gagal memperbarui pembayaran");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat pesanan…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Pesanan tidak ditemukan</p>
        <Link
          href="/orders"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const paymentColors: Record<string, string> = {
    unpaid: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/orders"
            className="text-blue-600 hover:text-blue-800 font-medium mb-2 inline-block"
          >
            ← Kembali ke Pesanan
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {order.order_number}
          </h1>
          <p className="text-gray-600 mt-1">
            Order placed on{" "}
            {new Date(order.created_at).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Isi Pesanan</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Jumlah: {item.quantity} × {formatRupiah(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatRupiah(
                          parseFloat(item.price) * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Info Pengiriman
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Alamat Pengiriman
                  </label>
                  <p className="mt-1 text-gray-900">
                    {order.shipping_address || "No address provided"}
                  </p>
                </div>

                {order.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Catatan Pesanan
                    </label>
                    <p className="mt-1 text-gray-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Pelanggan</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900">{order.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-900">{order.customer_email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Pesanan
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={updating}
                  className={`w-full px-3 py-2 rounded-lg font-semibold ${
                    statusColors[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  <option value="pending">Menunggu</option>
                  <option value="paid">Dibayar</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="delivered">Sampai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Pembayaran
                </label>
                <select
                  value={order.payment_status}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  disabled={updating}
                  className={`w-full px-3 py-2 rounded-lg font-semibold ${
                    paymentColors[order.payment_status] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  <option value="unpaid">Belum bayar</option>
                  <option value="paid">Lunas</option>
                  <option value="failed">Gagal</option>
                  <option value="refunded">Dikembalikan</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
