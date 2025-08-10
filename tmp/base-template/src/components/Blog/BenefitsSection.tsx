import { PageContent } from '@/types';

export default function BenefitsSection({ content }: { content: PageContent }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{content.heroCtaText}</h2>
      <div className="grid md:grid-cols-1 gap-6 text-gray-dark">
        {content.aboutServicesTitle.map((t, index) => (
          <div key={index}>
            <h3 className="font-semibold">{t}</h3>
            <p>{content.aboutServicesDescription[index].split('.')[0]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
