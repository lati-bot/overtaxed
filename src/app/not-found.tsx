import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border border-black/[0.06] p-8 sm:p-10">
          <div className="w-16 h-16 rounded-full bg-[#e8f4f0] flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#1a6b5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Page not found</h1>
          <p className="mt-2 text-[#666]">
            This page doesn&apos;t exist. Let&apos;s get you back on track.
          </p>
          
          <Link 
            href="/" 
            className="mt-6 block w-full text-center px-6 py-3.5 rounded-xl font-medium transition-colors bg-[#1a6b5a] hover:bg-[#155a4c] text-white"
          >
            Search Your Property
          </Link>
          
          <p className="mt-4 text-sm text-[#999]">
            Need help?{" "}
            <a href="mailto:hello@getovertaxed.com" className="text-[#1a6b5a] hover:underline">
              hello@getovertaxed.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
