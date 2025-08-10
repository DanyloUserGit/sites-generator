import { PageContent } from '@/types';

export default function Values({ content }: { content: PageContent }) {
  return (
    <section className="bg-white py-20 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {content.aboutServicesTitle.map((t, index) => (
          <div
            key={index}
            className="bg-gray-light p-6 rounded-xl shadow-card text-center"
          >
            <h3 className="text-xl font-semibold mb-2 text-accent">{t}</h3>
            <p className="text-gray-dark">
              {content.aboutServicesDescription[index]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
