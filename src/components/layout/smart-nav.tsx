"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { MarketplaceNav } from "@/components/layout/marketplace-nav";

export function SmartNav() {
  const pathname = usePathname();
  const MARKETPLACE_ACCOUNT_PATHS = [
    "/account/likes",
    "/account/following",
    "/account/messages",
    "/account/orders",
    "/account/disputes",
    "/account/offers",
  ];

  // Admin has its own layout — no nav
  if (pathname.startsWith("/admin")) return null;

  const isMarketplace =
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/seller") ||
    pathname === "/sell" ||
    pathname.startsWith("/sell/") ||
    MARKETPLACE_ACCOUNT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return isMarketplace ? <MarketplaceNav /> : <Navbar />;
}
