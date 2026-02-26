import { Suspense } from "react";
import { Metadata } from "next";
import ResultsContent from "./results-content";

export const metadata: Metadata = {
  title: "Your Property Tax Appeal Results | Overtaxed",
  description: "See how much you could save on property taxes. Get your protest package for $49.",
  openGraph: {
    title: "Your Property Tax Appeal Results | Overtaxed",
    description: "See how much you could save on property taxes. Get your protest package for $49.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Property Tax Appeal Results | Overtaxed",
    description: "See how much you could save on property taxes. Get your protest package for $49.",
  },
};

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
