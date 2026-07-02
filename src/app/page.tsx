import { Hero } from "@/components/landing/Hero";
import { Metrics } from "@/components/landing/Metrics";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30">
      <Hero />
      <Metrics />
      <Features />
      <Testimonials />
      <FAQ />
      <Pricing />
      <Footer />
    </div>
  );
}
