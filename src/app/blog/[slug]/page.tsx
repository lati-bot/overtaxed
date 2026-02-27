import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Overtaxed`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

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
              <Link href="/blog" className="hover:text-[#1a1a1a] transition-colors">
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

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-16">
        <Link
          href="/blog"
          className="text-[13px] text-[#1a6b5a] hover:underline mb-6 inline-block"
        >
          ← Back to Blog
        </Link>
        <time className="block text-[13px] text-[#999] mb-2">{post.date}</time>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
          {post.title}
        </h1>
        <p className="text-[15px] text-[#666] mb-8">By {post.author}</p>

        {/* Prose content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#1a1a1a]
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-[#444] prose-p:leading-relaxed
            prose-a:text-[#1a6b5a] prose-a:underline prose-a:underline-offset-2
            prose-li:text-[#444] prose-li:leading-relaxed
            prose-strong:text-[#1a1a1a]
            prose-table:text-[15px]
            prose-th:bg-[#1a6b5a] prose-th:text-white prose-th:px-4 prose-th:py-2
            prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-black/[0.06]"
          dangerouslySetInnerHTML={{ __html: post.htmlContent! }}
        />

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-white border border-black/[0.06] text-center">
          <h2 className="text-2xl font-semibold mb-3">
            Check if you&apos;re overpaying — it&apos;s free
          </h2>
          <p className="text-[#666] mb-6 max-w-lg mx-auto">
            Enter your address and we&apos;ll show you how your property compares
            to similar homes. If you&apos;re overpaying, get a $49 evidence
            packet to fight it.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-xl text-[15px] font-medium bg-[#1a6b5a] text-white hover:bg-[#155a4c] transition-colors"
          >
            Look Up My Property
          </Link>
        </div>
      </article>

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
