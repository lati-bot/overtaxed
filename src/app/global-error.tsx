"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-black/[0.06] p-8 sm:p-10">
            <div className="w-16 h-16 rounded-full bg-[#fef3c7] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#b45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-semibold text-[#1a1a1a]">Something went wrong</h1>
            <p className="mt-2 text-[#666]">
              We hit an unexpected error. This has been logged and we&apos;re looking into it.
            </p>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => reset()}
                className="block w-full text-center px-6 py-3.5 rounded-xl font-medium transition-colors bg-[#1a6b5a] hover:bg-[#155a4c] text-white"
              >
                Try Again
              </button>
              <Link 
                href="/" 
                className="block w-full text-center px-6 py-3 rounded-xl font-medium transition-colors text-[#1a6b5a] hover:bg-[#e8f4f0]"
              >
                Back to Home
              </Link>
            </div>
            
            <p className="mt-4 text-sm text-[#999]">
              If this keeps happening, email{" "}
              <a href="mailto:hello@getovertaxed.com" className="text-[#1a6b5a] hover:underline">
                hello@getovertaxed.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
