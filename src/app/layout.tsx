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
  title: "Overtaxed — Cook County Appeal Evidence for Professional Review",
  description: "Overtaxed reconstructs Cook County public records and organizes comparable, supporting, adverse, and unresolved evidence into an inspectable case file for professional review.",
  metadataBase: new URL("https://getovertaxed.com"),
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Cook County Appeal Evidence, Organized for Review | Overtaxed",
    description: "An inspectable, source-linked evidence-preparation workflow for Cook County residential appeal professionals.",
    siteName: "Overtaxed",
    type: "website",
    url: "https://getovertaxed.com",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Overtaxed — Cook County appeal evidence organized for professional review" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cook County Appeal Evidence, Organized for Review | Overtaxed",
    description: "An inspectable, source-linked evidence-preparation workflow for Cook County residential appeal professionals.",
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
