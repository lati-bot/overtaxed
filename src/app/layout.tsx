import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Overtaxed — Evidence Preparation for Property Tax Appeal Teams",
  description: "Overtaxed is exploring a review-first workflow for Cook County residential appeal teams: source-linked public records, comparable screening, exclusions, and open questions.",
  metadataBase: new URL("https://getovertaxed.com"),
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Overtaxed — More Room for Professional Judgment",
    description: "A review-first evidence preparation workflow for Cook County residential appeal teams.",
    siteName: "Overtaxed",
    type: "website",
    url: "https://getovertaxed.com",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Overtaxed — less assembly, more room for professional judgment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Overtaxed — More Room for Professional Judgment",
    description: "A review-first evidence preparation workflow for Cook County residential appeal teams.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
