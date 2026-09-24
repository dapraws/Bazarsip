"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

interface Supplier {
  id: number;
  name: string;
  whatsapp: string | null;
  location: string | null;
  notes: string | null;
  product_count: number;
}

const EMPTY_FORM = { name: "", whatsapp: "", location: "", notes: "" };

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.success) setSuppliers(data.data);
    } catch {
      setError("Gagal memuat supplier");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setFormData({
      name: supplier.name,
      whatsapp: supplier.whatsapp ?? "",
      location: supplier.location ?? "",
      notes: supplier.notes ?? "",
    });
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        editing ? `/api/suppliers/${editing.id}` : "/api/suppliers",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal menyimpan");
        return;
      }

      setShowModal(false);
      fetchSuppliers();
    } catch {
      setError("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(supplier: Supplier) {
    const warning =
      supplier.product_count > 0
        ? `Hapus ${supplier.name}? ${supplier.product_count} produk akan kehilangan info suppliernya (produknya sendiri tidak terhapus).`
        : `Hapus ${supplier.name}?`;

    if (!confirm(warning)) return;

    await fetch(`/api/suppliers/${supplier.id}`, { method: "DELETE" });
    fetchSuppliers();
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Supplier
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Tempat kulakan tiap barang, biar tidak lupa saat restock.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="shrink-0 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Tambah
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-600">Belum ada supplier.</p>
          <button
            onClick={openCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Tambah supplier pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => {
            const chat = whatsappLink(supplier.whatsapp);

            return (
              <div
                key={supplier.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
              >
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {supplier.name}
                  </h2>
                  {supplier.location && (
                    <p className="text-sm text-gray-600 mt-0.5">
                      {supplier.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {supplier.product_count} produk
                  </p>
                </div>

                {supplier.notes && (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5 whitespace-pre-wrap">
                    {supplier.notes}
                  </p>
                )}

                <div className="flex gap-2 mt-auto pt-1">
                  {chat && (
                    <a
                      href={chat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Chat WA
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(supplier)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => handleDelete(supplier)}
                    className="px-3 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? "Ubah Supplier" : "Tambah Supplier"}
              </h2>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Grosir Tanah Abang"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  placeholder="0812-3456-7890"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Boleh ditulis bebas: 0812…, +62…, atau 812… sama saja.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Blok A lt.2, atau link Shopee/IG"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Min order 3 pcs, kirim hari Selasa, orangnya lama bales…"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
