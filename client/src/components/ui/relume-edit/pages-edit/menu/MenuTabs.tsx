import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function MenuTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'seo';

  const siteId = searchParams.get('id');
  const currentPageId = searchParams.get('page_id');

  const tabs = [
    { key: 'content', label: 'Content' },
    { key: 'seo', label: 'SEO' },
  ];

  return (
    <div className="flex gap-4 border-b border-neutral-700 mt-4">
      {tabs.reverse().map((t) => {
        const href = `/relume-edit-site/site-pages/?id=${siteId}&page_id=${currentPageId}&tab=${t.key}`;
        const isActive = tab === t.key;

        return (
          <Link
            key={t.key}
            href={href}
            className={`pb-2 px-3 border-b-2 transition-all ${
              isActive
                ? 'border-accent text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
