import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { RealPhotos } from "@/components/sections/RealPhotos";
import { Specs } from "@/components/sections/Specs";
import { DemoSection } from "@/components/virtual-phone/DemoSection";
import { Why } from "@/components/sections/Why";
import { Purchase } from "@/components/sections/Purchase";
import { FAQ } from "@/components/sections/FAQ";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: d.faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Why />
        <DemoSection />
        <RealPhotos />
        <Purchase />
        <Specs />
        <FAQ />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
