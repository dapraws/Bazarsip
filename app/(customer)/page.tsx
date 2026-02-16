import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    eyebrow: "NEW COLLECTION",
    title1: "Bold Looks.",
    title2: "Unapologetic",
    title3: "Style.",
    desc: "Don’t just blend in. Discover premium streetwear and accessories designed to make a statement in every step.",
    cta: "SHOP NOW",
    img: "https://images.unsplash.com/photo-1520975682031-a7a2b6a9b7f5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "EDITORIAL",
    title1: "Clean",
    title2: "Street",
    title3: "Essentials.",
    desc: "Curated essentials for your everyday fit—minimal, versatile, and premium.",
    cta: "EXPLORE",
    img: "https://images.unsplash.com/photo-1520975918108-2fbd4c7237a8?auto=format&fit=crop&w=1600&q=80",
  },
];

const bestselling = [
  {
    name: "SAGE GREEN LINEN BUTTON-UP",
    price: 249000,
    tag: "MEN'S WEAR",
    img: "https://images.unsplash.com/photo-1520975682031-a7a2b6a9b7f5?auto=format&fit=crop&w=900&q=80",
    liked: false,
  },
  {
    name: "LONG TRENCH COAT BEIGE",
    price: 649000,
    tag: "WOMEN'S WEAR",
    img: "https://images.unsplash.com/photo-1542060748-10c28b62716c?auto=format&fit=crop&w=900&q=80",
    liked: true,
  },
  {
    name: "BLUE LOAFERS",
    price: 949000,
    tag: "SHOES",
    img: "https://images.unsplash.com/photo-1528701800489-20be3c2ea573?auto=format&fit=crop&w=900&q=80",
    liked: false,
  },
  {
    name: "ADIDAS TRACK JACKET",
    price: 675000,
    tag: "MEN'S WEAR",
    img: "https://images.unsplash.com/photo-1520975681623-8b0a5b6b4f9f?auto=format&fit=crop&w=900&q=80",
    liked: false,
  },
  {
    name: "NAVY BLUE MEN'S LINEN SHIRT",
    price: 349000,
    tag: "MEN'S WEAR",
    img: "https://images.unsplash.com/photo-1520975935095-50d0670ddf9c?auto=format&fit=crop&w=900&q=80",
    liked: false,
  },
];

const categoryCards = [
  {
    title: "New Arrivals",
    subtitle: "Fresh styles every week.",
    cta: "SHOP NEW ARRIVALS",
    img: "https://images.unsplash.com/photo-1520975869019-0e1d7d0c6b2b?auto=format&fit=crop&w=1400&q=80",
    href: "/shop?sort=newest",
    large: true,
  },
  {
    title: "The Alpine Collection",
    subtitle: "Timeless sophistication meets extreme comfort.",
    cta: "VIEW COLLECTION",
    img: "https://images.unsplash.com/photo-1520975938462-9f5a5e51f1d6?auto=format&fit=crop&w=1400&q=80",
    href: "/shop?category=outerwear",
    large: false,
  },
  {
    title: "Finish your look",
    subtitle: "Accessories that elevate.",
    cta: "SHOP ACCESSORIES",
    img: "https://images.unsplash.com/photo-1520975906023-05a3b6f2c8c7?auto=format&fit=crop&w=1400&q=80",
    href: "/shop?category=accessories",
    large: false,
  },
  {
    title: "Daily Carry",
    subtitle: "Essentials for every day.",
    cta: "SHOP BAGS",
    img: "https://images.unsplash.com/photo-1520975911339-8a3c4c1d9a63?auto=format&fit=crop&w=1400&q=80",
    href: "/shop?category=bags",
    large: false,
  },
];

const brands = [
  "THE NORTH FACE",
  "NIKE",
  "RALPH LAUREN",
  "TISSOT",
  "TOMMY HILFIGER",
  "ADIDAS",
  "LEVI'S",
];

export default function LandingPage() {
  return (
    <div className="bg-[#f6f7fb]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* HERO SLIDER */}
        <HeroSlider />

        {/* BESTSELLING */}
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

          <div className="mt-6 relative">
            <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bestselling.map((p) => (
                <div key={p.name} className="min-w-[220px]">
                  <ProductMiniCard p={p} />
                </div>
              ))}
            </div>
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
                href="/shop?category=outerwear"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                EXPLORE OUTERWEAR <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SHOP BY CATEGORY */}
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-light text-neutral-700">
                Shop by{" "}
                <span className="italic text-neutral-900">category</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Explore our diverse collections tailored to elevate your
                wardrobe and express your unique style.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-neutral-600 hover:underline"
            >
              More category →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* left large */}
            <CategoryCard {...categoryCards[0]} />

            {/* right stack */}
            <div className="grid gap-6">
              <CategoryCard {...categoryCards[1]} />
              <div className="grid gap-6 sm:grid-cols-2">
                <CategoryCard {...categoryCards[2]} />
                <CategoryCard {...categoryCards[3]} />
              </div>
            </div>
          </div>
        </section>

        {/* BRANDS */}
        <section className="mt-10">
          <div className="grid grid-cols-3 gap-6 md:grid-cols-7">
            {brands.map((b) => (
              <div
                key={b}
                className="grid h-14 place-items-center rounded-2xl bg-white text-xs font-semibold tracking-wide text-neutral-600 shadow-card"
              >
                {b}
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="mt-14">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-neutral-700">
                The Word on{" "}
                <span className="italic text-neutral-900">the Street</span>
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Don’t just take our word for it. Here’s what our community loves
                about the fit, fabric, and feel.
              </p>
            </div>

            <div className="hidden gap-2 md:flex">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card hover:bg-neutral-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card hover:bg-neutral-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <TestimonialCard variant="muted" name="John L." />
            <TestimonialCard variant="active" name="Anna M." />
            <TestimonialCard variant="muted" name="Sarah G." />
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
                  hacks. Don’t sleep on it.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroSlider() {
  // versi “static” dulu (tanpa state), tapi UI sudah mirip.
  const s = heroSlides[0];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-neutral-900 shadow-card">
      <div className="absolute inset-0">
        <Image
          src={s.img}
          alt="Hero"
          fill
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black/25" />

      <div className="relative p-10 md:p-12">
        <div className="text-xs font-semibold tracking-[0.25em] text-white/80">
          {s.eyebrow}
        </div>

        <h1 className="mt-4 text-4xl font-light leading-tight text-white md:text-6xl">
          {s.title1} <br />
          <span className="font-semibold">{s.title2}</span>{" "}
          <span className="italic">{s.title3}</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-white/80">{s.desc}</p>

        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
        >
          {s.cta}
        </Link>

        {/* dots */}
        <div className="mt-8 flex justify-center gap-3">
          <span className="h-1.5 w-10 rounded-full bg-white/80" />
          <span className="h-1.5 w-10 rounded-full bg-white/25" />
          <span className="h-1.5 w-10 rounded-full bg-white/25" />
        </div>

        {/* arrows */}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-2 md:flex">
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/20">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/20">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ProductMiniCard({ p }: { p: any }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative aspect-[4/5] w-full bg-neutral-200">
          <Image
            src={p.img}
            alt={p.name}
            fill
            className="object-cover"
            sizes="220px"
          />
        </div>

        <div className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold tracking-wide text-white">
          {p.tag}
        </div>
        <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80">
          <span className={p.liked ? "text-red-500" : "text-neutral-700"}>
            ♥
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[11px] font-semibold tracking-wide text-neutral-800">
          {p.name}
        </div>
        <div className="mt-2 text-right text-xs text-neutral-600">
          Rp. {Intl.NumberFormat("id-ID").format(p.price)}
        </div>
        <button className="mt-3 w-full rounded-full bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  subtitle,
  cta,
  img,
  href,
  large,
}: {
  title: string;
  subtitle: string;
  cta: string;
  img: string;
  href: string;
  large: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl shadow-card ${large ? "min-h-[260px]" : "min-h-[120px]"}`}
    >
      <div className="absolute inset-0">
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
      <div className="absolute inset-0 bg-black/35 group-hover:bg-black/40 transition" />

      <div className="relative p-8 text-white">
        <div className="text-xl font-semibold">{title}</div>
        <div className="mt-1 text-sm text-white/80">{subtitle}</div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur">
          {cta} <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function TestimonialCard({
  variant,
  name,
}: {
  variant: "active" | "muted";
  name: string;
}) {
  const active = variant === "active";
  return (
    <div
      className={`rounded-3xl p-8 shadow-card ${active ? "bg-white" : "bg-white/60"}`}
    >
      <div className="text-5xl text-neutral-300">“</div>
      <div
        className={`mt-3 text-sm leading-relaxed ${active ? "text-neutral-700" : "text-neutral-400"}`}
      >
        {active
          ? "I was skeptical about buying coats online, but the sizing guide was spot on. The big trench looks way more expensive than it is."
          : "Finally found hoodies with the perfect boxy fit. The fabric is thick and feels premium. Shipping was super fast too."}
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
