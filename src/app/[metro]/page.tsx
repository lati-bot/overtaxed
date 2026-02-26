import { Metadata } from "next";
import { notFound } from "next/navigation";
import { METROS, METRO_SLUGS } from "@/lib/metros";
import MetroPageClient from "./MetroPageClient";

interface Props {
  params: Promise<{ metro: string }>;
}

export async function generateStaticParams() {
  return METRO_SLUGS.map((metro) => ({ metro }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { metro: slug } = await params;
  const metro = METROS[slug];
  if (!metro) return {};

  const countyList = metro.counties.join(", ");
  return {
    title: `Property Tax Protest in ${metro.name} | $49 Evidence Packet | Overtaxed`,
    description: `Protest your property taxes in ${metro.name} (${countyList}). Get a $49 evidence packet with comparable properties, cover letter, and step-by-step filing guide. ${metro.propertyCount} properties analyzed.`,
    openGraph: {
      title: `Property Tax Protest in ${metro.name} | Overtaxed`,
      description: `Get your $49 evidence packet to protest property taxes in ${countyList}.`,
    },
  };
}

export default async function MetroPage({ params }: Props) {
  const { metro: slug } = await params;
  const metro = METROS[slug];
  if (!metro) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: metro.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MetroPageClient metro={metro} />
    </>
  );
}
