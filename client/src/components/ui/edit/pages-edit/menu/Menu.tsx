import { useAuth } from '@/hooks/AuthContext';
import { Page } from '@/types';
import { baseUrl } from '@/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MenuItem from './MenuItem';
import Loader from '@/components/ui/loader/Loader';

export default function Menu() {
  const [pages, setPages] = useState<Page[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useAuth();
  const tab = searchParams.get('tab') || 'seo';

  const siteId = searchParams.get('id');
  const currentPageId = searchParams.get('page_id');

  useEffect(() => {
    if (!siteId) return;

    const fetchPages = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/sites/site-pages/${siteId}`, {
          headers: { Authorization: `Bearer ${token.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch pages');
        const data: Page[] = await res.json();
        setPages(data);

        if (!currentPageId) {
          const homePage = data.find(
            (p) => p.pageName.toLowerCase() === 'home',
          );
          if (homePage) {
            router.replace(
              `/edit-site/site-pages/?id=${siteId}&page_id=${homePage.id}&tab=${tab}`,
            );
          }
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    };

    fetchPages();
  }, [siteId]);

  return (
    <>
      {!pages.length ? (
        <Loader />
      ) : (
        <div className="flex w-full flex-wrap bg-neutral-800 p-2 gap-8 rounded-sm">
          {pages.map((page: Page) => (
            <MenuItem
              key={page.id}
              page={page}
              currentPageId={currentPageId}
              tab={tab}
            />
          ))}
        </div>
      )}
    </>
  );
}
