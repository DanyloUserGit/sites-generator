import { PageContent } from '@/types';
import Image from 'next/image';

export default function ArticleHero({ content }: { content: PageContent }) {
  return (
    <section className="text-center">
      <h1 className="text-3xl font-bold mb-4">{content.heroTitle}</h1>
      <p className="text-gray-dark max-w-2xl mx-auto">
        {content.heroDescription}
      </p>

      <Image
        src={content.heroCtaImg}
        alt={content.heroCtaText}
        width={800}
        height={400}
        className="mt-8 rounded-xl mx-auto"
      />
    </section>
  );
}
