'use client';

import { baseUrl } from '@/utils';
import { useEffect, useState, useRef } from 'react';

type Language = { lname: string; lcode: string };

export default function LanguageAutoSearch({
  setSelectedLanguage,
}: {
  setSelectedLanguage: (language: string | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [showLang, setShowLang] = useState('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setLanguages([]);
      setLoading(false);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }

    setLoading(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeout = setTimeout(() => {
      fetch(`${baseUrl}/api/languages?query=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          const data = await res.json();
          setLanguages(data || []);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Fetch error:', err);
            setLanguages([]);
          }
        })
        .finally(() => setLoading(false));
    }, 700);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (lang: Language) => {
    setShowLang(lang.lname);
    setSelectedLanguage(lang.lcode);
    setLanguages([]);
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        id="language"
        value={showLang}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowLang(e.target.value);
          setSelectedLanguage(null);
        }}
        placeholder="Enter language..."
        className="bg-neutral-700 text-neutral-100 rounded-lg px-4 py-2 border border-neutral-500 focus:outline-none focus:border-primary-light transition-colors duration-300"
      />

      {loading && <p className="text-neutral-400 text-sm">Loading...</p>}

      {!loading && languages.length > 0 && (
        <ul className="bg-neutral-700 rounded-lg mt-1 border border-neutral-500 max-h-48 overflow-y-auto">
          {languages.map((lang) => (
            <li
              key={lang.lcode}
              onClick={() => handleSelect(lang)}
              className="cursor-pointer px-4 py-2 hover:bg-primary-light text-neutral-100"
            >
              {lang.lname} ({lang.lcode})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
