"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import Link from "next/link";

const ProductTable = lazy(() => import("@/components/admin/ProductTable"));
const ProductsSearch = lazy(() => import("@/components/admin/ProductSearch"));

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category_name: string;
  image_url: string;
  is_active: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/products?page=${page}&limit=10&search=${search}`,
      );
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus produk ini?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Produk dihapus");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600 mt-1 text-sm">Kelola barang dagangan</p>
        </div>
        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Tambah Produk</span>
        </Link>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <ProductsSearch
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          onSearch={fetchProducts}
        />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <ProductTable
          products={products}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onDelete={handleDelete}
          onPageChange={setPage}
        />
      </Suspense>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border animate-pulse">
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );
}
