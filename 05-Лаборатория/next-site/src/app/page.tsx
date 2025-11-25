import Header from '@/components/01-Header';
import Hero from '@/components/02-Hero';
import Features from '@/components/03-Features';
import Gallery from '@/components/04-Gallery';
import Footer from '@/components/05-Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header (sticky) */}
      <Header />

      {/* Main content */}
      <main className="pt-20">
        {/* Hero section */}
        <Hero />

        {/* Features */}
        <div className="bg-white py-20">
          <Features />
        </div>

        {/* Dynamic Category Gallery - загружается из Firebase */}
        <div className="py-20">
          <Gallery />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
