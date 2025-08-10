import { PageContent, Site } from '@/types';
import Image from 'next/image';

export default function Map({
  content,
  site,
}: {
  content: PageContent;
  site: Site;
}) {
  return (
    <section className="py-20 px-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        {content.findUsText}
      </h2>
      <div className="relative m-auto w-[55%] h-80 bg-gray-light rounded-xl overflow-hidden">
        <Image
          src={content?.mapImageUrl || ''}
          alt={site.city}
          className="w-full h-full object-cover m-auto"
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>
    </section>
  );
}
