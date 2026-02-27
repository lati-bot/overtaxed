"use client";

import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-b border-black/[0.06]">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-5 sm:py-6 text-left group"
              aria-expanded={isOpen}
            >
              <h3 className="text-lg font-medium text-[#1a1a1a] pr-4 group-hover:text-[#1a6b5a] transition-colors">
                {item.q}
              </h3>
              <span
                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#999] transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="8" y1="2" x2="8" y2="14" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                </svg>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? "max-h-96 pb-6 sm:pb-8" : "max-h-0"
              }`}
            >
              <p className="text-[15px] leading-relaxed text-[#666] font-light pr-10">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
