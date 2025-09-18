import Loader from '@/components/ui/loader/Loader';
import { useAuth } from '@/hooks/AuthContext';
import { IRelumePage } from '@/types';
import { baseUrl } from '@/utils';
import { useEffect, useState } from 'react';
import MenuItem from './MenuItem';
import { useRouter } from 'next/router';

export default function Menu() {
  const [pages, setPages] = useState<IRelumePage[] | null>(null); 
  const router = useRouter();
  const token = useAuth();

  const { id: siteId, page_id: currentPageId, tab = 'seo' } = router.query;

  useEffect(() => {
    if (!siteId || typeof siteId !== 'string') return;

    const fetchPages = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/generate-from-relume/site-pages/${siteId}`,
          {
            headers: { Authorization: `Bearer ${token.token}` },
          },
        );
        if (!res.ok) throw new Error('Failed to fetch pages');
        const data: IRelumePage[] = await res.json();
        setPages(data);

        if (!currentPageId && data.length > 0) {
          const firstPage = data[0];
          router.replace({
            pathname: '/relume-edit-site/site-pages',
            query: { id: siteId, page_id: firstPage.id, tab },
          });
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        setPages([]);
      }
    };

    fetchPages();
  }, [siteId, currentPageId, tab]);

  if (pages === null) {
    return <Loader />;
  }

  if (pages.length === 0) {
    return (
      <div className="flex w-full justify-center p-4 text-neutral-400">
        No pages found
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap bg-neutral-800 p-2 gap-8 rounded-sm">
      {pages.map((page) => (
        <MenuItem
          key={page.id}
          page={page}
          currentPageId={currentPageId as string}
          tab={tab as string}
        />
      ))}
    </div>
  );
}
