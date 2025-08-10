import { PageContent } from '@/types';

export default function Hero({ content }: { content: PageContent }) {
  return (
    <section className="bg-gray-light py-20 text-center px-6">
      <h1 className="text-4xl font-bold text-navy mb-4">{content.heroTitle}</h1>
      <p className="text-lg max-w-3xl mx-auto text-gray-dark">
        {content.heroDescription}
      </p>
    </section>
  );
}
