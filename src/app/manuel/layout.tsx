import type { Metadata } from "next";
import { Fraunces, Archivo } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-manuel-serif",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-manuel-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Manuel Gutierrez — Barber, Chicago",
  description: "Old-school barbering, sharp lines, no rush. Walk-ins welcome, appointments preferred.",
  robots: { index: false, follow: false },
};

export default function ManuelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${archivo.variable}`}>
      {children}
    </div>
  );
}
