"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface Crumb {
  label: string;
  href: string;
}

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  crumbs?: Crumb[];
}

export function BackHeader({ title, subtitle, href, crumbs }: BackHeaderProps) {
  const router = useRouter();

  const backHref = href ?? crumbs?.[crumbs.length - 1]?.href;

  return (
    <div className="sticky top-0 z-30 border-b border-surface-border bg-white/95 backdrop-blur-md px-4 py-3 -mx-4 sm:-mx-6 lg:-mx-8 sm:px-6 lg:px-8 mb-6">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-text-primary transition-colors hover:bg-surface-border active:bg-surface-border"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-text-primary transition-colors hover:bg-surface-border active:bg-surface-border"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          {/* Breadcrumbs */}
          {crumbs && crumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-0.5">
              {crumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-surface-border">/</span>}
                  <Link href={crumb.href} className="hover:text-text-primary transition-colors">
                    {crumb.label}
                  </Link>
                </span>
              ))}
              <span className="text-surface-border">/</span>
            </nav>
          )}
          <p className="text-sm font-bold text-text-primary truncate">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-text-muted truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
