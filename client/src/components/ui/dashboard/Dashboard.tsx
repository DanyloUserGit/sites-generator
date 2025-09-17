import { Site, SiteMethod } from '@/types';
import { baseUrl } from '@/utils';
import { useEffect, useState } from 'react';
import DashboardItem from './DashboardItem';
import Header from './Header';
import { useAuth } from '@/hooks/AuthContext';
import Loader from '../loader/Loader';

export default function Dashboard({ label }: { label: SiteMethod }) {
  const PAGE_SIZE = 5;

  const [sites, setSites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loader, setLoader] = useState(false);
  const token = useAuth();
  useEffect(() => {
    setLoader(true);
    if (label === 'Default template') {
      fetch(`${baseUrl}/api/sites?page=${page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token.token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setSites(data.data);
          setTotalPages(data.totalPages);
          setLoader(false);
        });
    }
    if (label === 'Relume') {
      fetch(`${baseUrl}/api/generate-from-relume?page=${page}`, {
        headers: { Authorization: `Bearer ${token.token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setSites(data.data);
          setTotalPages(data.totalPages);
          setLoader(false);
        });
    }
    if (label === 'All websites') {
      fetch(`${baseUrl}/api/sites/get-all?page=${page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token.token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setSites(data.data);
          setTotalPages(data.totalPages);
          setLoader(false);
        });
    }
  }, [page, token, label]);

  return (
    <div className="mt-12 flex flex-col">
      <>
        {totalPages && sites ? (
          <>
            <Header />
            {sites.map((site: Site) => (
              <DashboardItem
                key={site.id}
                id={site.id}
                city={site.city}
                services={site.services}
                language={site.language}
                createdAt={site.createdAt}
              />
            ))}

            {totalPages > 1 ? (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-neutral-700 text-neutral-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-neutral-400 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-neutral-700 text-neutral-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : (
              ''
            )}
          </>
        ) : (
          loader && <Loader />
        )}
      </>
    </div>
  );
}
