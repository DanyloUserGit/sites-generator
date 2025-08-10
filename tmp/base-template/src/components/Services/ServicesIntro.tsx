import { PageContent } from '@/types';

export default function ServicesIntro({ content }: { content: PageContent }) {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl font-bold text-navy mb-6">{content.heroTitle}</h1>
      <p className="text-gray-dark max-w-2xl mx-auto">
        {content.heroDescription}
      </p>
    </div>
  );
}
