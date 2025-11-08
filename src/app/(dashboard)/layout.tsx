import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
