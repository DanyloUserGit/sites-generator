'use client';

import { useAuth } from '@/hooks/AuthContext';
import { baseUrl } from '@/utils';
import { useEffect, useRef, useState } from 'react';

export default function RelumePageAutosearch({
  setPageId,
  id,
}: {
  setPageId: (language: string | null) => void;
  id: string | null;
}) {
  const [query, setQuery] = useState('');
  const [showLang, setShowLang] = useState('');
  const [pages, setPages] = useState<{ name: string; id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id) return;
    if (query.length < 2) {
      setPages([]);
      setLoading(false);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }

    setLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeout = setTimeout(() => {
      fetch(
        `${baseUrl}/api/generate-from-relume/pages/${id}?query=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token.token}` },
        },
      )
        .then(async (res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          const data = await res.json();
          setPages(data || []);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Fetch error:', err);
            setPages([]);
          }
        })
        .finally(() => setLoading(false));
    }, 700);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (page: { name: string; id: string }) => {
    setShowLang(page.name);
    setPageId(page.id);
    setPages([]);
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        id="pages"
        value={showLang}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowLang(e.target.value);
          setPageId(null);
        }}
        placeholder="Enter page name..."
        className="bg-neutral-700 text-neutral-100 rounded-lg px-4 py-2 border border-neutral-500 focus:outline-none focus:border-primary-light transition-colors duration-300"
      />

      {loading && <p className="text-neutral-400 text-sm">Loading...</p>}

      {!loading && pages.length > 0 && (
        <ul className="bg-neutral-700 rounded-lg mt-1 border border-neutral-500 max-h-48 overflow-y-auto">
          {pages.map((page) => (
            <li
              key={page.name}
              onClick={() => handleSelect(page)}
              className="cursor-pointer px-4 py-2 hover:bg-primary-light text-neutral-100"
            >
              {page.name} ({page.id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
