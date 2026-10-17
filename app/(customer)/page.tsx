// app/(customer)/page.tsx
import Image from "next/image";
import Link from "next/link";
import { pool } from "@/lib/db";
import { sizedImage } from "@/lib/image";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  image_url?: string | null;
  images?: string[] | null;
  category_name?: string | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  product_count?: string | number;
};

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [products, categories] = await Promise.all([
    getProducts(8),
    getCategories(),
  ]);

  return (
    <div className="bg-[#f6f7fb]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-neutral-900 shadow-card">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1520975682031-a7a2b6a9b7f5?auto=format&fit=crop&w=1600&q=80"
              alt="Etalase Bazarsip"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
          <div className="absolute inset-0 bg-black/30" />

          <div className="relative p-10 md:p-12">
            <div className="text-xs font-semibold tracking-[0.25em] text-white/80">
              BARANG BARU
            </div>

            <h1 className="mt-4 text-4xl font-light leading-tight text-white md:text-6xl">
              Baju, Sepatu, Tas. <br />
              <span className="font-semibold">Buat</span>{" "}
              <span className="italic">Semua Usia.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-white/80">
              Koleksi anak, remaja, dan dewasa, merk maupun non-merk. Pilih
              yang cocok, tanya-tanya dulu juga boleh.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              LIHAT BARANG <span aria-hidden>→</span>
            </Link>

            <div className="mt-8 flex justify-center gap-3">
              <span className="h-1.5 w-10 rounded-full bg-white/80" />
              <span className="h-1.5 w-10 rounded-full bg-white/25" />
              <span className="h-1.5 w-10 rounded-full bg-white/25" />
            </div>

            <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-2 md:flex">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/20">
                ‹
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/20">
                ›
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-light text-neutral-700">
              Barang{" "}
              <span className="italic text-neutral-900">terbaru</span>
            </h2>
            <Link
              href="/shop"
              className="text-sm font-semibold text-neutral-600 hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="mt-6 flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((p) => (
              <div key={p.id} className="min-w-[220px]">
                <ProductMiniCard p={p} />
              </div>
            ))}
          </div>
        </section>

        {/* ART OF LAYERING */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-neutral-900 shadow-card">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1520975868721-7b07f4619052?auto=format&fit=crop&w=1800&q=80"
                alt="Padu padan"
                fill
                className="object-cover opacity-85"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative p-10 md:p-12">
              <h3 className="text-4xl font-light text-white">
                Padu <span className="italic">Padan</span>
              </h3>
              <p className="mt-4 max-w-xl text-sm text-white/80">
                Atasan, bawahan, sampai aksesoris. Dicari satu-satu atau
                sekalian satu set.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                JELAJAHI <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* SHOP BY CATEGORY (ambil dari DB) */}
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-light text-neutral-700">
                Belanja per{" "}
                <span className="italic text-neutral-900">kategori</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Cari lebih cepat lewat jenis barangnya.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-neutral-600 hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/shop?categoryId=${c.id}`}
                className="group rounded-3xl bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-36 overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={sizedImage(pickCategoryImage(c), 640)}
                    alt={c.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-semibold tracking-wide">
                    {c.name}
                  </div>
                  <span className="text-neutral-500 group-hover:text-neutral-900">
                    →
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {(c.product_count ?? "0").toString()} items
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mt-14">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-neutral-700">
                Kata{" "}
                <span className="italic text-neutral-900">pelanggan</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                (Segera hadir)
              </p>
            </div>

            <div className="hidden gap-2 md:flex">
              <button
                disabled
                className="grid h-10 w-10 cursor-not-allowed place-items-center rounded-full bg-white/70 text-neutral-400 shadow-card"
              >
                ‹
              </button>
              <button
                disabled
                className="grid h-10 w-10 cursor-not-allowed place-items-center rounded-full bg-white/70 text-neutral-400 shadow-card"
              >
                ›
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="h-56 rounded-3xl bg-white p-8 shadow-card">
              <div className="h-6 w-24 rounded bg-neutral-100" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-neutral-100" />
                <div className="h-3 w-5/6 rounded bg-neutral-100" />
                <div className="h-3 w-4/6 rounded bg-neutral-100" />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-100" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-neutral-100" />
                  <div className="h-3 w-16 rounded bg-neutral-100" />
                </div>
              </div>
            </div>

            <div className="h-56 rounded-3xl bg-white p-8 shadow-card">
              <div className="h-6 w-24 rounded bg-neutral-100" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-neutral-100" />
                <div className="h-3 w-5/6 rounded bg-neutral-100" />
                <div className="h-3 w-4/6 rounded bg-neutral-100" />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-100" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-neutral-100" />
                  <div className="h-3 w-16 rounded bg-neutral-100" />
                </div>
              </div>
            </div>

            <div className="h-56 rounded-3xl bg-white p-8 shadow-card">
              <div className="h-6 w-24 rounded bg-neutral-100" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-neutral-100" />
                <div className="h-3 w-5/6 rounded bg-neutral-100" />
                <div className="h-3 w-4/6 rounded bg-neutral-100" />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-100" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-neutral-100" />
                  <div className="h-3 w-16 rounded bg-neutral-100" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function ProductMiniCard({ p }: { p: Product }) {
  const img = pickProductImage(p);
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative aspect-[4/5] w-full bg-neutral-200">
          <Image
            src={sizedImage(img, 640)}
            alt={p.name}
            fill
            className="object-cover"
            sizes="220px"
          />
        </div>

        <div className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold tracking-wide text-white">
          {(p.category_name ?? "PRODUCT").toUpperCase()}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-800">
          {p.name}
        </div>
        <div className="mt-2 text-right text-xs text-neutral-600">
          Rp. {Intl.NumberFormat("id-ID").format(Number(p.price))}
        </div>

        <Link
          href={`/shop/${p.slug}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}

function TestimonialCard({ active, name }: { active: boolean; name: string }) {
  return (
    <div
      className={`rounded-3xl p-8 shadow-card ${active ? "bg-white" : "bg-white/60"}`}
    >
      <div className="text-5xl text-neutral-300">“</div>
      <div
        className={`mt-3 text-sm leading-relaxed ${active ? "text-neutral-700" : "text-neutral-400"}`}
      >
        {active
          ? "I was skeptical about buying coats online, but the sizing guide was spot on. The trench looks way more expensive than it is."
          : "Finally found pieces with the perfect fit. The fabric feels premium and shipping was super fast."}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-200" />
        <div>
          <div
            className={`text-sm font-semibold ${active ? "text-neutral-900" : "text-neutral-500"}`}
          >
            {name}
          </div>
          <div
            className={`text-xs ${active ? "text-yellow-500" : "text-yellow-300"}`}
          >
            ★★★★★
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Data for the storefront home page.
 *
 * This is a server component, so it reads the database directly rather than
 * calling its own API over HTTP. The previous version built a URL from
 * NEXT_PUBLIC_APP_URL: a variable that is not set anywhere: and so always
 * fell back to a hardcoded http://localhost:3000, which fails on any host
 * that does not happen to serve on that port.
 */
async function getProducts(limit: number) {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.slug, p.price, p.image_url, p.images,
            c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_active = true
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows as Product[];
}

async function getCategories() {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.slug, c.image_url,
            COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
     GROUP BY c.id
     ORDER BY c.name ASC`,
  );
  return rows as Category[];
}

/** --- image pickers (utamakan data DB) --- */
function pickProductImage(p: Product) {
  const dbImage =
    (p.image_url && p.image_url.trim()) ||
    (Array.isArray(p.images) && p.images.length ? p.images[0] : "");

  if (dbImage) return normalizeUrl(dbImage);

  // fallback kalau DB kosong (sementara)
  return "https://images.unsplash.com/photo-1520975682031-a7a2b6a9b7f5?auto=format&fit=crop&w=900&q=80";
}

function pickCategoryImage(c: Category) {
  if (c.image_url && c.image_url.trim()) return normalizeUrl(c.image_url);

  // fallback Unsplash
  return "https://images.unsplash.com/photo-1520975906023-05a3b6f2c8c7?auto=format&fit=crop&w=900&q=80";
}

function normalizeUrl(url: string) {
  if (url.startsWith("http")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}
