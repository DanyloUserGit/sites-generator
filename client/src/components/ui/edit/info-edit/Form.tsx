import { SiteExtended } from '@/types';
import { useState } from 'react';
import Typography from '../../Typography';
import Button from '../../Button';

export default function Form({ site }: { site: SiteExtended }) {
  const [formData, setFormData] = useState(site);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === 'favIcon' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, favIcon: reader.result as string }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="flex-1 mt-4 p-3 bg-neutral-800 text-white rounded-xl shadow">
      <form className="grid gap-4">
        <InputField label="ID" name="id" value={formData.id} disabled />
        <Typography variant="text">Need to generate with changes</Typography>
        <InputField
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
        />
        <InputField
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
        <InputField
          label="Language"
          name="language"
          value={formData.language}
          onChange={handleChange}
        />
        <InputField
          label="Services"
          name="services"
          value={formData.services}
          onChange={handleChange}
        />
        <Typography variant="text">No need to generate</Typography>
        <InputField
          label="Slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="favIcon" className="text-sm text-neutral-200">
            Favicon
          </label>
          <input
            type="file"
            accept="image/*"
            name="favIcon"
            id="favIcon"
            onChange={handleChange}
            className="bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2"
          />
          {formData.favIcon && (
            <img
              src={formData.favIcon}
              alt="Favicon Preview"
              className="w-16 h-16 mt-2 rounded border"
            />
          )}
        </div>
        <Button className="text-black" variant="action" onClick={() => {}}>
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
