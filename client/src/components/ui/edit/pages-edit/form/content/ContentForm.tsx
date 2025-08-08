import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContent } from '@/types';
import Loader from '@/components/ui/loader/Loader';
import Button from '@/components/ui/Button';
import { InputField, TextareaField } from '../seo/SeoForm';
import { baseUrl } from '@/utils';
import { useAuth } from '@/hooks/AuthContext';

export default function ContentForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('page_id');
  const tab = searchParams.get('tab');

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PageContent>({
    heroTitle: '',
    heroDescription: '',
    heroCtaText: '',
    benefits: [],
    formText: '',
    backgroundImageUrl: '',
    mapImageUrl: '',
    heroCtaImg: '',
    ctaDescription: '',
    aboutServicesTitle: [],
    aboutServicesDescription: [],
  });

  const [benefitsStr, setBenefitsStr] = useState('');
  const [aboutServicesTitleStr, setAboutServicesTitleStr] = useState('');
  const [aboutServicesDescriptionStr, setAboutServicesDescriptionStr] =
    useState('');
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
        if (!res.ok) throw new Error('Failed to fetch content data');

        const data = await res.json();
        setFormData(data);
        setAboutServicesTitleStr(
          typeof data.aboutServicesTitle === 'string'
            ? JSON.parse(data.aboutServicesTitle).join(', ')
            : (data.aboutServicesTitle || []).join(', '),
        );
        setAboutServicesDescriptionStr(
          typeof data.aboutServicesDescription === 'string'
            ? JSON.parse(data.aboutServicesDescription).join('|\n')
            : (data.aboutServicesDescription || []).join('|\n'),
        );
        setBenefitsStr(
          typeof data.benefits === 'string'
            ? JSON.parse(data.benefits).join(', ')
            : (data.benefits || []).join(', '),
        );
      } catch (err) {
        console.error('Fetch content error:', err);
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
    const aboutServicesTitle = aboutServicesTitleStr
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
    const aboutServicesDescription = aboutServicesDescriptionStr
      .split('|')
      .map((b) => b.trim())
      .filter(Boolean);
    const benefits = benefitsStr
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      benefits: JSON.stringify(benefits),
      aboutServicesTitle: JSON.stringify(aboutServicesTitle),
      aboutServicesDescription: JSON.stringify(aboutServicesDescription),
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
          body: JSON.stringify(payload),
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
          label="Hero Title"
          name="heroTitle"
          value={formData.heroTitle || ''}
          onChange={handleChange}
        />
        <TextareaField
          label="Hero Description"
          name="heroDescription"
          value={formData.heroDescription || ''}
          onChange={handleChange}
        />
        <InputField
          label="CTA Text"
          name="heroCtaText"
          value={formData.heroCtaText || ''}
          onChange={handleChange}
        />
        <TextareaField
          label="CTA Description"
          name="ctaDescription"
          value={formData.ctaDescription || ''}
          onChange={handleChange}
        />
        <InputField
          label="Benefits (comma separated)"
          name="benefits"
          value={benefitsStr}
          onChange={(e) => setBenefitsStr(e.target.value)}
        />
        <InputField
          label="Services Title (comma separated)"
          name="aboutServicesTitle"
          value={aboutServicesTitleStr}
          onChange={(e) => setAboutServicesTitleStr(e.target.value)}
        />
        <TextareaField
          label="Services Description ( | separated)"
          name="aboutServicesDescription"
          value={aboutServicesDescriptionStr.replaceAll('"', '')}
          onChange={(e) => setAboutServicesDescriptionStr(e.target.value)}
        />
        {/* 
        <TextareaField
          label="Form Text"
          name="formText"
          value={formData.formText || ''}
          onChange={handleChange}
        /> */}
        <InputField
          label="Background Image URL"
          name="backgroundImageUrl"
          value={formData.backgroundImageUrl || ''}
          onChange={handleChange}
        />
        {formData.mapImageUrl && (
          <InputField
            label="Map Image URL"
            name="mapImageUrl"
            value={formData.mapImageUrl || ''}
            onChange={handleChange}
          />
        )}
        <InputField
          label="CTA Image URL"
          name="heroCtaImg"
          value={formData.heroCtaImg || ''}
          onChange={handleChange}
        />

        <Button onClick={handleSubmit} className="text-black" variant="action">
          Apply changes
        </Button>
      </form>
    </div>
  );
}
