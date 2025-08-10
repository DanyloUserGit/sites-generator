import { PageContent, Site } from '@/types';
import Link from 'next/link';

export default function Hero({
  content,
  site,
}: {
  content: PageContent;
  site: Site;
}) {
  return (
    <section className="bg-white py-24 text-center max-w-7xl mx-auto px-6">
      <h1 className="text-5xl font-extrabold text-navy mb-6">
        {content.heroTitle}
      </h1>
      <p className="text-lg text-gray-dark max-w-3xl mx-auto mb-8">
        {content.heroDescription}
      </p>
      <Link
        href={site.heroCtaUrl}
        className="inline-block bg-accent hover:bg-[#d87e00] text-white font-semibold rounded-lg px-8 py-3 transition"
      >
        {content.heroCtaText}
      </Link>
    </section>
  );
}
