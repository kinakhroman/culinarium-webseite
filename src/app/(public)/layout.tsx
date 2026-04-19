import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileOrderBar } from "@/components/mobile-order-bar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen relative z-[2]">{children}</main>
      <Footer />
      <div className="lg:hidden h-20" aria-hidden />
      <MobileOrderBar />
    </>
  );
}
