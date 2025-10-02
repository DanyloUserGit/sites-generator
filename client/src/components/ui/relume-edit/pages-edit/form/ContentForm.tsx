import Button from '@/components/ui/Button';
import {
  InputField,
  TextareaField,
} from '@/components/ui/edit/pages-edit/form/seo/SeoForm';
import Loader from '@/components/ui/loader/Loader';
import { useAuth } from '@/hooks/AuthContext';
import { ITag } from '@/types';
import { baseUrl } from '@/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ContentForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('page_id');
  const tab = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<ITag[]>([]);
  const token = useAuth();

  useEffect(() => {
    if (!id || !tab) return;

    const fetchTags = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/generate-from-relume/site-page-tab/${id}?tab=${tab}`,
          { headers: { Authorization: `Bearer ${token.token}` } },
        );
        if (!res.ok) throw new Error('Failed to fetch tags');

        const data: ITag[] = await res.json();

        // Встановлюємо tags у стан у порядку position
        setTags(data.sort((a, b) => a.position - b.position));
      } catch (err) {
        console.error('Fetch tags error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [id, tab]);

  const handleChange = (tagId: string, value: string) => {
    setTags((prev) =>
      prev.map((tag) => (tag.id === tagId ? { ...tag, value } : tag)),
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/generate-from-relume/site-page-tab/${id}?tab=${tab}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tags),
        },
      );

      if (!res.ok) console.error('Update failed');
    } catch (error) {
      console.error('Request error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 mt-4 bg-neutral-800 text-white rounded-xl shadow">
      <form className="grid gap-4">
        {tags.map((tag) => {
          const isTextTag = [
            'p',
            'span',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
          ].includes(tag.type);
          const isImgTag = tag.type === 'img';

          return (
            <div key={tag.id} className="bg-neutral-700 p-3 rounded-lg">
              <label className="block text-sm mb-2">
                {tag.type.toUpperCase()}
              </label>

              {isTextTag ? (
                <TextareaField
                  label=""
                  name={tag.id}
                  value={tag.value}
                  onChange={(e) => handleChange(tag.id, e.target.value)}
                />
              ) : isImgTag ? (
                <InputField
                  label="Image URL"
                  name={tag.id}
                  value={tag.value}
                  onChange={(e) => handleChange(tag.id, e.target.value)}
                />
              ) : (
                <InputField
                  label="Value"
                  name={tag.id}
                  value={tag.value}
                  onChange={(e) => handleChange(tag.id, e.target.value)}
                />
              )}
            </div>
          );
        })}

        <Button onClick={handleSubmit} className="text-black" variant="action">
          Apply changes
        </Button>
      </form>
    </div>
  );
}
