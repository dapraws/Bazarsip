import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#1f1f1f] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="text-2xl font-semibold italic">Bazarsip</div>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Redefining urban style. Premium quality, bold designs, and
              unapologetic fashion delivered to your doorstep.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <SocialButton label="Instagram" href="#">
                ◎
              </SocialButton>
              <SocialButton label="X" href="#">
                𝕏
              </SocialButton>
              <SocialButton label="LinkedIn" href="#">
                in
              </SocialButton>
              <SocialButton label="Facebook" href="#">
                f
              </SocialButton>
            </div>
          </div>

          <div>
            <div className="text-lg font-semibold">Collections</div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/shop" className="hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/shop?dept=men" className="hover:text-white">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/shop?dept=women" className="hover:text-white">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/shop?dept=kids" className="hover:text-white">
                  Kids
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-lg font-semibold">Support</div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <a href="#" className="hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Shipping &amp; Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-lg font-semibold">Get in Touch</div>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <span>⌁</span> Indonesia
              </li>
              <li className="flex items-center gap-2">
                <span>☎</span> +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2">
                <span>✉</span> support@bazarsip.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>© 2026 Bazarsip. All Rights Reserved.</div>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="hover:text-white">
                Terms &amp; Conditions
              </a>
              <span className="text-white/30">|</span>
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <span className="text-white/30">|</span>
              <a href="#" className="hover:text-white">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm hover:bg-white/15"
    >
      {children}
    </a>
  );
}
