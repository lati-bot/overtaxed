"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    setLoading(true);
    router.push(`/results?address=${encodeURIComponent(address.trim())}`);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">
            overtaxed
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-gray-900 transition-colors">
              How it Works
            </button>
            <button onClick={() => scrollToSection("pricing")} className="hover:text-gray-900 transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-gray-900 transition-colors">
              FAQ
            </button>
          </div>
          <Button variant="outline" size="sm" className="text-sm" onClick={() => scrollToSection("pricing")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-gray-900 leading-[1.1]">
            Your property tax
            <br />
            <span className="text-primary">is too high.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Cook County over-assesses thousands of homes every year. 
            Get a professional appeal package and pay only what&apos;s fair.
          </p>
          
          <form onSubmit={handleSearch} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <Input 
              type="text"
              placeholder="Enter your property address or PIN"
              className="h-14 text-lg px-6 flex-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
            <Button 
              type="submit" 
              size="lg" 
              className="h-14 px-8 text-base font-medium"
              disabled={loading || !address.trim()}
            >
              {loading ? "Searching..." : "Check My Property"}
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-gray-400">
            Free instant analysis • No signup required
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-semibold text-gray-900">$847</div>
              <div className="mt-2 text-gray-500">Average annual savings</div>
            </div>
            <div>
              <div className="text-5xl font-semibold text-gray-900">21%</div>
              <div className="mt-2 text-gray-500">Average assessment reduction</div>
            </div>
            <div>
              <div className="text-5xl font-semibold text-gray-900">72%</div>
              <div className="mt-2 text-gray-500">Appeal success rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900">
            How it works
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
            We analyze your property against thousands of comparable homes to build your case.
          </p>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-semibold">
                1
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Enter your address</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">
                We pull your property data from Cook County&apos;s public records automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-semibold">
                2
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">We find your comps</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">
                Our system identifies similar properties that sold for less or are assessed lower than yours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-semibold">
                3
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">File your appeal</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">
                Download your complete appeal package and file it yourself — we show you exactly how.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Simple pricing
          </h2>
          <p className="mt-4 text-gray-500">
            No percentage of savings. No hidden fees. Just a flat rate.
          </p>
          
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
            <div className="text-6xl font-semibold text-gray-900">$99</div>
            <div className="mt-2 text-gray-500">One-time payment</div>
            
            <ul className="mt-8 space-y-4 text-left max-w-sm mx-auto">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Complete appeal package with 5+ comparable properties</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Pre-filled appeal forms ready to submit</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Step-by-step filing instructions</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Delivered in 48 hours</span>
              </li>
            </ul>
            
            <Button size="lg" className="mt-10 h-14 px-12 text-base font-medium" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Get Your Appeal Package
            </Button>
            
            <p className="mt-4 text-sm text-gray-400">
              Compare to attorneys who charge 30% of savings (~$250+)
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900">
            Questions & Answers
          </h2>
          
          <div className="mt-12 space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Do I need a lawyer to appeal?</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                No. Individual homeowners can file appeals themselves (called &ldquo;pro se&rdquo;) at both the Assessor&apos;s Office and Board of Review. We give you everything you need.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">What if my appeal doesn&apos;t work?</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                Appeals have a high success rate when you have good comparable properties. If your assessment isn&apos;t reduced, you&apos;ve lost nothing but the filing time — there&apos;s no penalty for appealing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">When can I file an appeal?</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                Cook County opens appeals by township on a rotating schedule. We&apos;ll tell you if your township is currently open or when it will be.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Why is this so much cheaper than attorneys?</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                Attorneys charge a percentage of savings because they can. We use technology to automate the research that used to take hours. You get the same comparable property analysis at a fraction of the cost.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">What properties do you support?</h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                Currently we support single-family homes and small multi-family buildings (2-4 units) in Cook County, IL. Condos and commercial properties require different approaches — contact us if you need help with those.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Stop overpaying.
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Check your property in 30 seconds and see if you have a case.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="mt-8 h-14 px-12 text-base font-medium"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Check My Property
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © 2026 Overtaxed. Cook County property tax appeals made simple.
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
