import { ArticlesSection } from "@/components/sections/articles-section";
import { DestinationsSection } from "@/components/sections/destinations-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { getHomePageData } from "@/lib/cms/content";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "LombokAdvisor | Paket Wisata, Honeymoon, dan Sewa Mobil di Lombok",
  description:
    "LombokAdvisor menghadirkan paket wisata, honeymoon, sewa mobil, dan inspirasi destinasi Lombok yang mudah dikonsultasikan.",
  path: "/",
  keywords: [
    "paket wisata lombok",
    "paket honeymoon lombok",
    "sewa mobil lombok",
    "travel lombok",
  ],
});

export default async function Home() {
  const { services, destinations, articles, testimonials } = await getHomePageData();

  return (
    <>
      <HeroSection />
      <ServicesSection services={services} />
      <DestinationsSection destinations={destinations} />
      <SocialProofSection testimonials={testimonials} />
      <ArticlesSection articles={articles} />
    </>
  );
}
