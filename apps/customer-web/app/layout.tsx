import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { StickyCartBar } from "@/components/layout/sticky-cart-bar";
import { BottomNav } from "@/components/layout/bottom-nav";

export const metadata: Metadata = {
  title: "Gulavlival Grand — Stay • Dine • Experience",
  description:
    "Order handcrafted artisanal pizzas, burgers, kulhad chai, shakes, momos, and continental specialties from Gulavlival Grand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('gg_theme_v2') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-amber-200 selection:text-amber-900 pb-28 sm:pb-16 bg-[#faf9f6] dark:bg-[#0d0e12] text-neutral-900 dark:text-neutral-100">
        <Suspense fallback={<div className="h-16 bg-white dark:bg-neutral-950 border-b border-amber-100 dark:border-neutral-800" />}>
          <Header />
        </Suspense>
        
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
          {children}
        </main>

        <Suspense fallback={null}>
          <StickyCartBar />
        </Suspense>

        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>

        <footer className="border-t border-neutral-200 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/60 backdrop-blur-xs py-8 px-4 text-center text-xs text-neutral-500 dark:text-neutral-400 mb-12 sm:mb-0">
          <p className="font-display font-bold text-neutral-800 dark:text-neutral-100 text-sm tracking-wide mb-1">
            GULAVLIVAL GRAND
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium mb-3">
            Stay • Dine • Experience
          </p>
          <p className="text-neutral-600 dark:text-neutral-400">
            Freshly prepared artisanal dining • Cash on delivery & table service
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-4 text-xs font-semibold text-amber-800 dark:text-amber-400">
            <a href="tel:+919149150004" className="hover:underline">📞 +91 9149150004</a>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <a href="tel:+919411896149" className="hover:underline">📞 +91 9411896149</a>
          </div>
          <p className="mt-3 text-neutral-400 dark:text-neutral-500">© 2026 Gulavlival Grand. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
