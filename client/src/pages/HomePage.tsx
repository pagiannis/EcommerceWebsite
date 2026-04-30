import HeroSection from "../components/home/HeroSection";
import BrandLogosBar from "../components/home/BrandLogosBar";
import NewArrivalsSection from "../components/home/NewArrivalsSection";
import TopSellingSection from "../components/home/TopSellingSection";
import DressStyleSection from "../components/home/DressStyleSection";
import TestimonialsSection from "../components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <BrandLogosBar />
      <NewArrivalsSection />
      <hr className="mx-auto max-w-7xl border-gray-200" />
      <TopSellingSection />
      <DressStyleSection />
      <TestimonialsSection />
    </div>
  );
}
