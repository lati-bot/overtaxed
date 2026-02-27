import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Overtaxed | Property Tax Guides & Tips",
  description:
    "Expert guides on protesting property taxes, filing deadlines, and saving money on your property tax bill.",
  openGraph: {
    title: "Blog — Overtaxed",
    description:
      "Expert guides on protesting property taxes, filing deadlines, and saving money on your property tax bill.",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#1a1a1a]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#f7f6f3]/90 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl tracking-[-0.02em] font-medium text-[#1a1a1a] flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-[3px] bg-[#1a6b5a]" />
            overtaxed
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-[13px] text-[#666] tracking-wide">
              <Link href="/" className="hover:text-[#1a1a1a] transition-colors">
                Home
              </Link>
              <Link
                href="/blog"
                className="text-[#1a1a1a] font-medium transition-colors"
              >
                Blog
              </Link>
            </div>
            <Link
              href="/"
              className="hidden sm:block px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#1a6b5a] text-white hover:bg-[#155a4c] transition-colors"
            >
              Check My Address
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-10">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Blog
        </h1>
        <p className="text-lg text-[#666] max-w-2xl">
          Guides, deadlines, and tips for lowering your property taxes.
        </p>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <article className="p-6 rounded-2xl border border-black/[0.06] bg-white hover:border-[#1a6b5a]/30 transition-colors">
                <time className="text-[13px] text-[#999]">{post.date}</time>
                <h2 className="text-xl font-semibold mt-1 mb-2 group-hover:text-[#1a6b5a] transition-colors">
                  {post.title}
                </h2>
                <p className="text-[15px] text-[#666] leading-relaxed">
                  {post.description}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-black/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] text-[#999]">© 2026 Overtaxed</div>
          <div className="flex items-center gap-6 text-[13px] text-[#999]">
            <Link href="/terms" className="hover:text-[#1a1a1a] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Privacy</Link>
            <a href="mailto:hello@getovertaxed.com" className="hover:text-[#1a1a1a] transition-colors">hello@getovertaxed.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
