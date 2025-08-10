import { PageContent } from '@/types';

export default function Features({ content }: { content: PageContent }) {
  const icons = [
    <svg
      key={1}
      className="w-10 h-10 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M12 2v20M2 12h20" />
    </svg>,
    <svg
      key={2}
      className="w-10 h-10 text-accent overflow-visible"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M12 2a10 10 0 0110 10v2a10 10 0 01-10 10H6a6 6 0 010-12h6z" />
    </svg>,
    <svg
      key={3}
      className="w-10 h-10 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>,
  ];

  const benefits =
    content.benefits.length > 3
      ? content.benefits.slice(0, 3)
      : content.benefits;
  console.log(benefits);

  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-6 py-20 bg-gray-light rounded-lg shadow-md"
    >
      <div className="grid md:grid-cols-3 gap-12">
        {benefits.map((item, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="mb-6">{icons[index]}</div>
            <h3 className="text-xl font-semibold text-primary mb-2">{item}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
