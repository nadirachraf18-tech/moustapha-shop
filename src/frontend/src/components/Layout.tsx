import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main data-ocid="page.main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
