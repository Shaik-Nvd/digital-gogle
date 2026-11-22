import Hero from "@/components/sections/Hero";
import WorkGrid from "@/components/sections/WorkGrid";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Marquee from "@/components/ui/Marquee";
import Statement from "@/components/sections/Statement";
import GogleStageMount from "@/components/sections/GogleStageMount";

export default function Home() {
  const marqueeItems = [
    "Development",
    "3D Interactions",
    "Booking Systems",
    "E-Commerce UI",
    "API Integration",
    "Responsive Build",
    "SEO Foundations",
    "Web Design"
  ];

  const marqueeItems2 = [
    "build.software()",
    "app.build()",
    "data.automate()",
    "growth.scale()",
    "ai.deploy()",
    "security.audit()",
    "content.produce()"
  ];

  return (
    <>
      <Hero />
      <Marquee items={marqueeItems} variant="display" />
      <Statement />
      <Process />
      <WorkGrid />
      <Services />
      <Testimonials />
      <Marquee items={marqueeItems2} reverse />
      <Contact />
      {/* Page-wide 3D layer: Gogle docks in the hero, statement and process slots */}
      <GogleStageMount />
    </>
  );
}
