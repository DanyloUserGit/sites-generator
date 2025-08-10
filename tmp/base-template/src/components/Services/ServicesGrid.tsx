import { PageContent } from '@/types';
import ServiceCard from './ServiceCard';

export default function ServicesGrid({ content }: { content: PageContent }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {content.aboutServicesTitle.map((t, index) => (
        <ServiceCard
          key={index}
          title={t}
          description={content.aboutServicesDescription[index]}
        />
      ))}
    </div>
  );
}
