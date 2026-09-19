import type { Metadata } from "next";

const title = "Overtaxed — Property Tax Appeal Packages for $49";
const description = "Compare your property assessment with nearby homes. Get comparable data, an evidence packet, and filing instructions for a $49 flat fee.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getovertaxed.com/homeowners" },
  // Preview-stage preservation, not a consumer-acquisition launch. Revisit at production approval.
  robots: { index: false, follow: true },
  openGraph: {
    title,
    description,
    url: "https://getovertaxed.com/homeowners",
    images: [{ url: "/og-image.png", width: 1200, height: 1200, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function HomeownersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
