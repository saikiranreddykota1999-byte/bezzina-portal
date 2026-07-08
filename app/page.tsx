import { Categories } from "@/components/home/categories";
import { CTA } from "@/components/home/cta";
import { Hero } from "@/components/home/hero";
import { Services } from "@/components/home/services";
import { WhyChoose } from "@/components/home/why-choose";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhyChoose />
      <Categories />
      <Services />
      <CTA />
    </main>
  );
}