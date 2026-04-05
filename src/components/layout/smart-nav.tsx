"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { MarketplaceNav } from "@/components/layout/marketplace-nav";

export function SmartNav() {
  const pathname = usePathname();
  const isMarketplace =
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/seller") ||
    pathname === "/sell" ||
    pathname.startsWith("/sell/");

  return isMarketplace ? <MarketplaceNav /> : <Navbar />;
}
