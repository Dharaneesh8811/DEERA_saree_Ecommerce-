import AboutHero from "@/components/about/AboutHero";
import BrandStory from "@/components/about/BrandStory";
import PhilosophySection from "@/components/about/PhilosophySection";
import SilkJourney from "@/components/about/SilkJourney";
import AboutDifference from "@/components/about/AboutDifference";
import AboutCTA from "@/components/about/AboutCTA";

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <BrandStory />
      <PhilosophySection />
      <SilkJourney />
      <AboutDifference />
      <AboutCTA />
    </main>
  );
}