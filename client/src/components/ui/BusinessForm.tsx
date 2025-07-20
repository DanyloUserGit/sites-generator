'use client';

import { useEffect, useState } from 'react';
import Button from './Button';
import LanguageAutoSearch from './LanguageAutoSearch';
import { useRouter } from 'next/router';
import { baseUrl } from '@/utils';

export default function BusinessForm({
  setShowFile,
}: {
  setShowFile: (s: boolean) => void;
}) {
  const [city, setCity] = useState('');
  const [services, setServices] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    city?: string;
    services?: string;
    language?: string;
  }>({});
  const router = useRouter();
  useEffect(() => {
    if (city.length || services.length || language) {
      setShowFile(false);
    } else {
      setShowFile(true);
    }
  }, [city, services, language]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!city.trim()) newErrors.city = 'City is required';
    if (!services.trim()) newErrors.services = 'Services are required';
    if (!language) newErrors.language = 'Language is required';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleCreateFromInput = async () => {
    try {
      if (!language) return;
      const response = await fetch(`${baseUrl}/api/sites/create-from-input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, services, language }),
      });

      if (!response.ok) {
        const error = await response.text();
        return;
      }
      router.replace('/');
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  return (
    <form
      className="flex flex-col gap-4 p-4 bg-neutral-800 rounded-2xl w-full"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col">
        <label htmlFor="city" className="text-neutral-200 text-sm mb-1">
          City<span className="text-danger">*</span>
        </label>
        <input
          id="city"
          type="text"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="bg-neutral-700 text-neutral-100 placeholder-neutral-400 rounded-lg px-4 py-2 border border-neutral-500 focus:outline-none focus:border-primary-light transition-colors duration-300"
        />
        {errors.city && (
          <p className="text-danger text-sm mt-1">{errors.city}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="business" className="text-neutral-200 text-sm mb-1">
          Services<span className="text-danger">*</span>
        </label>
        <input
          id="business"
          type="text"
          required
          value={services}
          onChange={(e) => setServices(e.target.value)}
          placeholder="Enter business services"
          className="bg-neutral-700 text-neutral-100 placeholder-neutral-400 rounded-lg px-4 py-2 border border-neutral-500 focus:outline-none focus:border-primary-light transition-colors duration-300"
        />
        {errors.services && (
          <p className="text-danger text-sm mt-1">{errors.services}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="language" className="text-neutral-200 text-sm mb-1">
          Language<span className="text-danger">*</span>
        </label>
        <LanguageAutoSearch setSelectedLanguage={setLanguage} />
        {errors.language && (
          <p className="text-danger text-sm mt-1">{errors.language}</p>
        )}
      </div>

      <div className="flex gap-[4px] w-full">
        <Button
          className="flex-1"
          onClick={() => {
            router.back();
          }}
        >
          Back
        </Button>
        <Button
          className="flex-1"
          variant="action"
          onClick={handleCreateFromInput}
        >
          Create
        </Button>
      </div>
    </form>
  );
}
