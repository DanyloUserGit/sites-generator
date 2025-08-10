import { PageContent, Site } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

export default function CTA({
  content,
  site,
}: {
  content: PageContent;
  site: Site;
}) {
  return (
    <section className="bg-primary text-white py-20 text-center max-w-7xl mx-auto px-6 rounded-xl my-12">
      <h2 className="text-3xl font-bold mb-4">{content.heroCtaText}</h2>
      <p className="mb-8 max-w-xl mx-auto">{content.ctaDescription}</p>
      {content.heroCtaImg && (
        <Image
          src={content.heroCtaImg}
          alt={content.heroCtaText}
          width={800}
          height={400}
          className="my-8 rounded-xl mx-auto"
        />
      )}

      <Link
        href={site.heroCtaUrl}
        className="inline-block bg-accent hover:bg-[#d87e00] px-8 py-4 rounded-lg font-semibold transition"
      >
        {content.heroCtaText}
      </Link>
    </section>
  );
}
