"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  product_count?: string | number;
};

function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClose: () => void,
) {
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    }

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, onClose]);
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openMega, setOpenMega] = useState(false);
  const [q, setQ] = useState("");
  const megaRef = useRef<HTMLDivElement>(null);

  useOutsideClick(megaRef, () => setOpenMega(false));

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

  const categoryColumns = useMemo(() => {
    // Split categories into up to 5 columns, to mimic the mega menu layout.
    const cols: Category[][] = [[], [], [], [], []];
    categories.forEach((c, idx) => {
      cols[idx % cols.length].push(c);
    });
    return cols.filter((c) => c.length);
  }, [categories]);

  return (
    <header className="sticky top-0 z-50 bg-[#1f1f1f] text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="text-xl font-semibold italic">
          Bazarsip
        </Link>

        <nav className="hidden items-center gap-6 text-xs uppercase tracking-wide md:flex">
          <Link href="/shop" className="opacity-90 hover:opacity-100">
            All Products
          </Link>

          <button
            type="button"
            onClick={() => setOpenMega((v) => !v)}
            className="opacity-90 hover:opacity-100"
          >
            Categories <span className="ml-1">▾</span>
          </button>

          <Link href="/shop?dept=men" className="opacity-90 hover:opacity-100">
            Men
          </Link>
          <Link
            href="/shop?dept=women"
            className="opacity-90 hover:opacity-100"
          >
            Women
          </Link>
          <Link href="/shop?dept=kids" className="opacity-90 hover:opacity-100">
            Kids
          </Link>
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-4">
          <form
            action="/shop"
            className="hidden w-105 items-center rounded-full bg-white/95 px-4 py-2 md:flex"
          >
            <input
              name="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm text-neutral-900 outline-none"
              placeholder="Search Product"
            />
            <span className="text-neutral-500">⌕</span>
          </form>

          <Link
            href="/profile"
            className="rounded-full p-2 hover:bg-white/10"
            aria-label="Account"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
              U
            </span>
          </Link>

          <Link
            href="/cart"
            className="relative rounded-full p-2 hover:bg-white/10"
            aria-label="Cart"
          >
            <span className="text-lg">👜</span>
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-neutral-900">
              2
            </span>
          </Link>

          <Link
            href="/my-orders"
            className="rounded-full p-2 hover:bg-white/10"
            aria-label="Orders"
          >
            <span className="text-lg">♡</span>
          </Link>
        </div>
      </div>

      {openMega && (
        <div ref={megaRef} className="relative">
          <div className="fixed inset-0 bg-black/35" />
          <div className="absolute left-0 right-0 top-0 bg-[#1f1f1f]">
            <div className="mx-auto max-w-6xl px-6 pb-6 pt-3">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
                <div>
                  <div className="mb-3 text-xs uppercase tracking-wide text-white/70">
                    Shop by Department
                  </div>
                  <ul className="space-y-2 text-[13px] text-white/90">
                    <li>
                      <Link href="/shop?dept=men" className="hover:underline">
                        Men
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop?dept=women" className="hover:underline">
                        Women
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop?dept=kids" className="hover:underline">
                        Kids
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop" className="hover:underline">
                        All Products
                      </Link>
                    </li>
                  </ul>
                </div>

                {categoryColumns.map((col, idx) => (
                  <div key={idx}>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/70">
                      Categories
                    </div>
                    <ul className="space-y-2 text-[13px] text-white/90">
                      {col.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/shop?categoryId=${c.id}`}
                            className="hover:underline"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-4 h-36 rounded-xl bg-white/5" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
