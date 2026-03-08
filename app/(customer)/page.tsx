// app/(customer)/page.tsx
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

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

export default async function LandingPage() {
  const [products, categories] = await Promise.all([
    getProducts({ page: 1, limit: 8, sort: "newest" }),
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
              alt="Hero"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
          <div className="absolute inset-0 bg-black/30" />

          <div className="relative p-10 md:p-12">
            <div className="text-xs font-semibold tracking-[0.25em] text-white/80">
              NEW COLLECTION
            </div>

            <h1 className="mt-4 text-4xl font-light leading-tight text-white md:text-6xl">
              Bold Looks. <br />
              <span className="font-semibold">Unapologetic</span>{" "}
              <span className="italic">Style.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-white/80">
              Don’t just blend in. Discover premium streetwear and accessories
              designed to make a statement in every step.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              SHOP NOW <span aria-hidden>→</span>
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
              Bestselling{" "}
              <span className="italic text-neutral-900">products</span>
            </h2>
            <Link
              href="/shop"
              className="text-sm font-semibold text-neutral-600 hover:underline"
            >
              More products →
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
                alt="Art of Layering"
                fill
                className="object-cover opacity-85"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative p-10 md:p-12">
              <h3 className="text-4xl font-light text-white">
                The Art of <span className="italic">Layering</span>
              </h3>
              <p className="mt-4 max-w-xl text-sm text-white/80">
                Step into the season with our signature trench coats. A perfect
                blend of classic tailoring and contemporary silhouette.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                EXPLORE <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* SHOP BY CATEGORY (ambil dari DB) */}
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-light text-neutral-700">
                Shop by{" "}
                <span className="italic text-neutral-900">category</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Explore our collections tailored to elevate your wardrobe.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-neutral-600 hover:underline"
            >
              More category →
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
                    src={pickCategoryImage(c)}
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
                The Word on{" "}
                <span className="italic text-neutral-900">the Street</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                (Coming soon) 
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

        {/* SUBSCRIBE */}
        <section className="mt-14 pb-16">
          <div className="relative overflow-hidden rounded-3xl bg-neutral-900 shadow-card">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1520975900956-2f6db1f7e4d8?auto=format&fit=crop&w=1800&q=80"
                alt="Subscribe"
                fill
                className="object-cover opacity-75"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative p-10 md:p-12">
              <div className="text-center text-white">
                <div className="text-3xl font-light">
                  Subscribe our email and
                </div>
                <div className="mt-2 text-4xl font-semibold">GET 15% OFF</div>

                <form className="mx-auto mt-6 flex max-w-xl gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-full bg-white/15 px-5 py-3 text-sm text-white outline-none placeholder:text-white/60 backdrop-blur"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-white/90"
                  >
                    Subscribe
                  </button>
                </form>

                <p className="mx-auto mt-4 max-w-2xl text-xs text-white/70">
                  Be the first to cop new drops, exclusive collabs, and styling
                  hacks.
                </p>
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
            src={img}
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
          href={`/shop/${p.id}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
        >
          View Detail
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

/** --- data fetchers (pakai DB via API routes kamu) --- */
async function getProducts(params: {
  page: number;
  limit: number;
  sort: "newest" | "price_asc" | "price_desc";
}) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const url = new URL(`${base}/api/products`);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));
  url.searchParams.set("sort", params.sort);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [] as Product[];

  const json = await res.json();
  return (json?.data ?? []) as Product[];
}

async function getCategories() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${base}/api/categories`, { cache: "no-store" });
  if (!res.ok) return [] as Category[];

  const json = await res.json();
  return (json?.data ?? []) as Category[];
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
