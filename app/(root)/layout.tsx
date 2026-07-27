import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import PixelScriptInjector from "@/components/storefront/PixelScriptInjector";
import { CartProvider } from "@/lib/store/cart-store";

export const revalidate = 120;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <PixelScriptInjector />
      <div className="min-h-screen flex flex-col bg-white text-black">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}

