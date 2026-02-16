"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  product_count?: string | number;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  stock: number;
  image_url: string | null;
  images: string[] | null;
  category_name?: string | null;
  category_slug?: string | null;
};

type ProductsResponse = {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function formatRupiah(v: string | number) {
  const n = typeof v === "string" ? Number(v) : v;
  return `Rp. ${Intl.NumberFormat("id-ID").format(Math.round(n || 0))}`;
}

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // query state
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number>(200000);
  const [maxPrice, setMaxPrice] = useState<number>(900000);
  type SortOption = "price_asc" | "price_desc" | "newest";
  const [sort, setSort] = useState<SortOption>("newest");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const json = await res.json();
        if (json?.success) setCategories(json.data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");
        if (search.trim()) params.set("search", search.trim());
        if (categoryId) params.set("categoryId", categoryId);
        if (minPrice) params.set("minPrice", String(minPrice));
        if (maxPrice) params.set("maxPrice", String(maxPrice));
        params.set("sort", sort);

        const res = await fetch(`/api/products?${params.toString()}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as ProductsResponse;

        if (json?.success) {
          setProducts(json.data || []);
          setTotalPages(json.pagination.totalPages || 1);
          setTotalItems(json.pagination.total || 0);
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [page, search, categoryId, minPrice, maxPrice, sort]);

  const pageButtons = useMemo(() => {
    // matches design: show left/right and some page numbers with ellipsis
    const tp = totalPages;
    const p = page;
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

    const set = new Set<number>();
    set.add(1);
    set.add(tp);
    [p - 1, p, p + 1].forEach((x) => x >= 1 && x <= tp && set.add(x));
    [2, 3, tp - 1, tp - 2].forEach((x) => x >= 1 && x <= tp && set.add(x));
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);

  function onApplyQuickCategory(id: string) {
    setCategoryId(id);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Home
        </Link>
        <span className="mx-2">›</span>
        All Product
      </div>

      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-light text-neutral-800">
            All <span className="italic">products</span>
          </h1>
          <div className="mt-2 text-sm text-neutral-500">
            {totalItems} items
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-500">Sort by:</div>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className="rounded-xl border bg-yellow-950 text-white-950 py-2 text-sm"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        {/* Filter Sidebar */}
        <aside className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <span>⎇</span> Filter
          </div>

          <div className="py-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              Categories <span className="text-neutral-400">▾</span>
            </div>

            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <button
                  onClick={() => onApplyQuickCategory("")}
                  className={`text-left hover:text-neutral-900 ${
                    !categoryId ? "font-semibold text-neutral-900" : ""
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onApplyQuickCategory(String(c.id))}
                    className={`text-left hover:text-neutral-900 ${
                      String(c.id) === categoryId
                        ? "font-semibold text-neutral-900"
                        : ""
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Divider />

          <div className="py-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              Price Range <span className="text-neutral-400">▾</span>
            </div>
            <div className="mt-3">
              <input
                type="range"
                min={0}
                max={2000000}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-neutral-500">
                <span>{formatRupiah(minPrice)}</span>
                <span>{formatRupiah(maxPrice)}</span>
              </div>
            </div>
          </div>

          <Divider />

          <div className="py-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              Search <span className="text-neutral-400">▾</span>
            </div>
            <div className="mt-3">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search product"
                className="w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </div>

          <Divider />

          {/* The design includes Size/Color/Brand. DB schema doesn’t include these yet.
              We keep the UI as "coming soon" to stay aligned with the mock. */}
          <div className="py-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              Size <span className="text-neutral-400">▾</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 opacity-40">
              {["S", "M", "L", "XL"].map((s) => (
                <div
                  key={s}
                  className="rounded-lg border px-3 py-2 text-center text-xs"
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-neutral-400">Coming soon</div>
          </div>

          <Divider />

          <div className="py-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              Color <span className="text-neutral-400">▾</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs opacity-40">
              {[
                { label: "Black", dot: "bg-black" },
                { label: "Red", dot: "bg-red-600" },
                { label: "Brown", dot: "bg-[#8b5a2b]" },
                { label: "Orange", dot: "bg-orange-500" },
                { label: "Pink", dot: "bg-pink-400" },
                { label: "Blue", dot: "bg-blue-600" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <span className={`h-3 w-3 rounded-full ${c.dot}`} />
                  {c.label}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-neutral-400">Coming soon</div>
          </div>

          <Divider />

          <div className="py-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              Brand <span className="text-neutral-400">▾</span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-neutral-700 opacity-40">
              {["Nike", "Adidas", "Zara", "Uniqlo"].map((b) => (
                <label key={b} className="flex items-center gap-2">
                  <input type="checkbox" disabled />
                  {b}
                </label>
              ))}
            </div>
            <div className="mt-2 text-xs text-neutral-400">Coming soon</div>
          </div>
        </aside>

        {/* Products */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 shadow-card">
                  <div className="aspect-4/5 animate-pulse rounded-2xl bg-neutral-200" />
                  <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-neutral-200" />
                  <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
                  <div className="mt-4 h-9 w-full animate-pulse rounded-full bg-neutral-200" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-card">
              <div className="text-lg font-semibold">No products found</div>
              <div className="mt-2 text-sm text-neutral-600">
                Try adjusting filters or search keywords.
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-end">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    pageButtons={pageButtons}
                    onPage={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-neutral-200" />;
}

function ProductCard({ p }: { p: Product }) {
  const tag = (p.category_name || "").toUpperCase() || "CATEGORY";
  const price = formatRupiah(p.price);
  const img = p.image_url || p.images?.[0] || "";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-200">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="aspect-4/5 w-full" />
        )}

        <div className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold tracking-wide text-white">
          {tag}
        </div>

        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-white/80 p-2 hover:bg-white"
          aria-label="Wishlist"
        >
          ♡
        </button>
      </div>

      <div className="mt-3">
        <Link
          href={`/shop/${p.id}`}
          className="text-[11px] font-semibold tracking-wide text-neutral-800 hover:underline"
        >
          {p.name}
        </Link>
        <div className="mt-2 text-right text-xs text-neutral-600">{price}</div>

        <button
          type="button"
          className="mt-3 w-full rounded-full bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  pageButtons,
  onPage,
}: {
  page: number;
  totalPages: number;
  pageButtons: number[];
  onPage: (p: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-full px-3 py-1 hover:bg-white disabled:opacity-40"
      >
        ‹
      </button>

      {pageButtons.map((p, idx) => {
        const prev = pageButtons[idx - 1];
        const needEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {needEllipsis && <span className="px-1">…</span>}
            <button
              type="button"
              onClick={() => onPage(p)}
              className={`rounded-full px-3 py-1 ${
                p === page ? "bg-blue-600 text-white" : "hover:bg-white"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-full px-3 py-1 hover:bg-white disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
