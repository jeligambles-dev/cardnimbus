export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { SmartNav } from "@/components/layout/smart-nav";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toast";
import { ChatWidget } from "@/components/support/chat-widget";
import { EmailDiscountPopup } from "@/components/email-discount-popup";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Card Nimbus — Pokemon Card Marketplace",
  description:
    "Buy, sell, and trade Pokemon cards on Card Nimbus — the boldest marketplace in the hobby.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body flex min-h-screen flex-col bg-surface text-text-primary antialiased">
        <SessionProvider>
          <SmartNav />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <ChatWidget />
          <EmailDiscountPopup />
        </SessionProvider>
      </body>
    </html>
  );
}
