import { useAuth } from '@/hooks/AuthContext';
import { baseUrl } from '@/utils';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Button from '../../Button';
import Loader from '../../loader/Loader';
import { IRelumeSite } from '@/types';

export default function Form({ site }: { site: IRelumeSite }) {
  const [formData, setFormData] = useState<IRelumeSite>(site);
  const token = useAuth();
  const params = useSearchParams();
  const id = params.get('id');
  const [loader, setLoader] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyChanges = async () => {
    setLoader(true);
    if (!formData) return;

    try {
      const res = await fetch(`${baseUrl}/api/generate-from-relume/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        console.error('Update failed');
        return;
      }

      setLoader(false);
    } catch (error) {
      console.error('Request error:', error);
    }
  };

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="p-3 bg-neutral-800 text-white rounded-xl shadow">
          <form className="grid gap-4">
            <InputField label="ID" name="id" value={formData.id} disabled />
            <InputField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <InputField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <InputField
              label="Services"
              name="services"
              value={formData.services}
              onChange={handleChange}
            />
            <InputField
              label="Language"
              name="language"
              value={formData.language}
              onChange={handleChange}
            />
            <InputField
              label="Domain"
              name="domain"
              value={formData.domain ?? ''}
              onChange={handleChange}
            />

            <Button
              className="text-black"
              variant="action"
              onClick={applyChanges}
            >
              Apply changes
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

function InputField({
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
