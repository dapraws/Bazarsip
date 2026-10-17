import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import { sizedImage } from "@/lib/image";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category_name: string;
  image_url: string;
  is_active: boolean;
  availability?: string;
  supplier_name?: string | null;
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  page: number;
  totalPages: number;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

function Thumb({ product, size }: { product: Product; size: number }) {
  if (product.image_url) {
    return (
      <Image
        src={sizedImage(product.image_url, 128)}
        alt={product.name}
        width={size}
        height={size}
        className="rounded object-cover shrink-0"
        style={{ width: size, height: size }}
        loading="lazy"
        // Cloudinary already returns the right size and format, so routing
        // it through our own optimizer only burns VPS CPU.
        unoptimized
      />
    );
  }

  return (
    <div
      className="rounded bg-gray-200 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        className="w-6 h-6 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

function StockBadge({ product }: { product: Product }) {
  if (product.availability === "preorder") {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
        Pre-order
      </span>
    );
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        product.stock > 10
          ? "bg-green-100 text-green-800"
          : product.stock > 0
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
      }`}
    >
      Stok {product.stock}
    </span>
  );
}

function StatusBadge({ product }: { product: Product }) {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        product.is_active
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {product.is_active ? "Tampil" : "Disembunyikan"}
    </span>
  );
}

export default function ProductTable({
  products,
  loading,
  page,
  totalPages,
  onDelete,
  onPageChange,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat produk…</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="mt-4 text-gray-600 font-medium">Belum ada produk</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Phone: a six-column table cannot be read on a 375px screen, so the
          same rows are stacked as cards with full-width tap targets. */}
      <ul className="md:hidden divide-y divide-gray-200">
        {products.map((product) => (
          <li key={product.id} className="p-4">
            <div className="flex gap-3">
              <Thumb product={product} size={56} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 break-words">
                  {product.name}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {formatRupiah(product.price)} · {product.category_name}
                </p>
                {product.supplier_name && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Supplier: {product.supplier_name}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <StockBadge product={product} />
                  <StatusBadge product={product} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Link
                href={`/products/${product.id}/edit`}
                className="flex-1 text-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ubah
              </Link>
              <button
                onClick={() => onDelete(product.id)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Produk", "Kategori", "Harga", "Stok", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Thumb product={product} size={48} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.supplier_name ?? product.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {product.category_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatRupiah(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StockBadge product={product} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge product={product} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ubah
                    </Link>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t flex items-center justify-between gap-3">
          <div className="text-sm text-gray-700 shrink-0">
            Hal {page}/{totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
