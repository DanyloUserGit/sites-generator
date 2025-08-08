import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SeoData } from '@/types';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { baseUrl } from '@/utils';
import { useAuth } from '@/hooks/AuthContext';
import Loader from '@/components/ui/loader/Loader';

export default function SeoForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('page_id');
  const tab = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<SeoData>({
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    schemaOrg: {},
  });

  const [keywordsStr, setKeywordsStr] = useState('');
  const [schemaOrgStr, setSchemaOrgStr] = useState('{}');
  const [schemaOrgError, setSchemaOrgError] = useState<string | null>(null);
  const token = useAuth();

  useEffect(() => {
    if (!id || !tab) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/sites/site-page-tab/${id}?tab=${tab}`,
          {
            headers: { Authorization: `Bearer ${token.token}` },
          },
        );
        if (!res.ok) throw new Error('Failed to fetch SEO data');

        const data = await res.json();

        setFormData(data);
        setKeywordsStr(
          typeof data.keywords === 'string'
            ? JSON.parse(data.keywords).join(', ')
            : (data.keywords || []).join(', '),
        );

        setSchemaOrgStr(() => {
          const raw = data.schemaOrg;

          if (!raw) return '{}';

          if (typeof raw === 'object') {
            return JSON.stringify(raw, null, 2);
          }

          if (typeof raw === 'string') {
            try {
              let cleaned = raw
                .replace(/^```html\n?/i, '')
                .replace(/```$/i, '');

              cleaned = cleaned
                .replace(/<script[^>]*>/i, '')
                .replace(/<\/script>/i, '');

              const parsed = JSON.parse(cleaned);
              return JSON.stringify(parsed, null, 2);
            } catch (err) {
              console.error('Failed to parse schemaOrg:', err);
              return '{}';
            }
          }

          return '{}';
        });
      } catch (err) {
        console.error('Fetch SEO error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, tab]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const parsedSchema: Record<string, string> = {};

    const keywords = keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    // parsedSchema = JSON.parse(schemaOrgStr);
    // setSchemaOrgError(null);

    const updatedData = {
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      keywords: JSON.stringify(keywords),
      schemaOrg: schemaOrgStr,
    };

    try {
      const res = await fetch(
        `${baseUrl}/api/sites/site-page-tab/${id}?tab=${tab}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        },
      );

      if (!res.ok) {
        console.error('Update failed');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Request error:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 mt-4 bg-neutral-800 text-white rounded-xl shadow">
      <form className="grid gap-4">
        <InputField
          label="Meta Title"
          name="metaTitle"
          value={formData.metaTitle || ''}
          onChange={handleChange}
        />
        <TextareaField
          label="Meta Description"
          name="metaDescription"
          value={formData.metaDescription || ''}
          onChange={handleChange}
        />
        <InputField
          label="Keywords (comma separated)"
          name="keywords"
          value={keywordsStr}
          onChange={(e) => setKeywordsStr(e.target.value)}
        />
        <TextareaField
          label="Schema.org JSON"
          name="schemaOrg"
          value={schemaOrgStr}
          onChange={(e) => setSchemaOrgStr(e.target.value)}
          rows={6}
        />
        {schemaOrgError && (
          <Typography variant="text" className="text-danger">
            {schemaOrgError}
          </Typography>
        )}
        <Button onClick={handleSubmit} className="text-black" variant="action">
          Apply changes
        </Button>
      </form>
    </div>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export function InputField({
  label,
  name,
  value,
  onChange,
  disabled = false,
}: InputProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm text-neutral-200 mb-1">
        {label}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light disabled:opacity-50"
      />
    </div>
  );
}

type TextareaProps = {
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
};

export function TextareaField({
  label,
  name,
  value,
  onChange,
  rows = 3,
}: TextareaProps) {
  return (
    <div className="flex flex-col ">
      <label htmlFor={name} className="text-sm text-neutral-200 mb-1">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className=" bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light font-mono h-fit"
      />
    </div>
  );
}
