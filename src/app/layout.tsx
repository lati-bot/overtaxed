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
  title: "Overtaxed — Property Tax Appeal Packages for $49",
  description: "Fight your property tax assessment with professional comparable data, evidence packets, and filing guides. 10 Texas counties + Cook County IL. $49 flat fee.",
  metadataBase: new URL("https://getovertaxed.com"),
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Overtaxed — Property Tax Appeal Packages for $49",
    description: "Fight your property tax assessment with professional comparable data, evidence packets, and filing guides. 10 Texas counties + Cook County IL. $49 flat fee.",
    siteName: "Overtaxed",
    type: "website",
    url: "https://getovertaxed.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Overtaxed — Property Tax Appeal Packages for $49" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Overtaxed — Property Tax Appeal Packages for $49",
    description: "Fight your property tax assessment with professional comparable data, evidence packets, and filing guides. 10 Texas counties + Cook County IL. $49 flat fee.",
    images: ["/og-image.png"],
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
