import { PageContent, Site } from '@/types';
import Link from 'next/link';

export default function Team({
  content,
  site,
}: {
  content: PageContent;
  site: Site;
}) {
  return (
    <section className="bg-primary text-white py-20 px-6 text-center">
      <h2 className="text-3xl font-bold mb-4">{content.heroCtaText}</h2>
      <p className="max-w-2xl mx-auto mb-8">{content.heroDescription}</p>

      <Link
        href={site.heroCtaUrl}
        className="inline-block bg-accent hover:bg-[#d87e00] px-8 py-4 rounded-lg font-semibold transition"
      >
        {content.heroCtaText}
      </Link>
    </section>
  );
}
