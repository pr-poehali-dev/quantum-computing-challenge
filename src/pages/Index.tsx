import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import Promo from "@/components/Promo";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <div id="features">
        <Featured />
      </div>
      <Promo />
      <div id="pricing">
        <Pricing />
      </div>
      <Footer />
    </main>
  );
};

export default Index;
