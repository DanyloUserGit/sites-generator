import { PageContent } from '@/types';

export default function TipsSection({ content }: { content: PageContent }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{content.benefitsTitle}</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-dark">
        {content.benefits.map((b, index) => (
          <li key={index}>{b}</li>
        ))}
      </ul>
    </section>
  );
}
