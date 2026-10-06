import HeroSection from "@/components/home/HeroSection";
import ShopByCraft from "@/components/home/ShopByCraft";
import EditorsPicks from "@/components/home/EditorsPicks";
import SilkStory from "@/components/home/SilkStory";
import OccasionSection from "@/components/home/OccasionSection";
import TrustSection from "@/components/home/TrustSection";
import SareeExpertCTA from "@/components/home/SareeExpertCTA";

export default function Home() {
  return (
    <main>
      <HeroSection />

      <ShopByCraft />

      <EditorsPicks />

      <SilkStory />

      <OccasionSection />

      <TrustSection />

      <SareeExpertCTA />
    </main>
  );
}