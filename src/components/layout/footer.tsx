import Link from 'next/link'

const SHOP_LINKS = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Raffles', href: '/raffles' },
  { label: 'Mystery Packs', href: '/mystery' },
  { label: 'Packs', href: '/shop?category=PACK' },
  { label: 'Booster Boxes', href: '/shop?category=BOX' },
  { label: 'Slabs', href: '/shop?category=SLAB' },
  { label: 'Singles', href: '/shop?category=SINGLE' },
  { label: 'Sell Your Cards', href: '/sell-your-cards' },
  { label: 'Sell on Marketplace', href: '/sell' },
]

const HELP_LINKS = [
  { label: 'FAQ', href: '/faq' },
  { label: 'How Raffles Work', href: '/help/raffles' },
  { label: 'How Mystery Works', href: '/help/mystery' },
  { label: 'Shipping & Returns', href: '/help/shipping' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Track Order', href: '/account/orders' },
]

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-surface-border bg-surface-raised">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Card Nimbus"
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-text-muted">
              The boldest Pokémon card marketplace in the hobby. Shop packs, boxes, slabs, and singles with confidence.
            </p>
            {/* Social links */}
            <div className="mt-4 flex gap-3">
              {[
                {
                  label: 'Twitter / X',
                  href: 'https://twitter.com',
                  path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.857L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
                },
                {
                  label: 'Instagram',
                  href: 'https://instagram.com',
                  path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
                },
                {
                  label: 'Discord',
                  href: 'https://discord.com',
                  path: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z',
                },
              ].map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-text-muted transition-colors hover:border-nimbus-500/50 hover:text-nimbus-500"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-text-secondary transition-colors hover:text-nimbus-500"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Help
            </h3>
            <ul className="space-y-2.5">
              {HELP_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-text-secondary transition-colors hover:text-nimbus-500"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Company
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-text-secondary transition-colors hover:text-nimbus-500"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-surface-border pt-6 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {year} Card Nimbus. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Not affiliated with Nintendo, Game Freak, or The Pokémon Company.
          </p>
        </div>
      </div>
    </footer>
  )
}
