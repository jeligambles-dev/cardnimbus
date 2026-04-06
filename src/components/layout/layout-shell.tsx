"use client";

import { usePathname } from "next/navigation";
import { SmartNav } from "./smart-nav";
import { Footer } from "./footer";
import { ChatWidget } from "@/components/support/chat-widget";
import { EmailDiscountPopup } from "@/components/email-discount-popup";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SmartNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
      <EmailDiscountPopup />
    </>
  );
}
