import { useEffect, useState } from 'react';
import Clip from '../svg/Clip';
import { SiteExtended } from '@/types';

export default function ImgFile({
  handleChange,
  formData,
}: {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: SiteExtended;
}) {
  return (
    <div className="w-full p-4 bg-neutral-800 rounded-2xl flex items-center justify-center">
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex gap-[8px] items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-neutral-500 hover:border-accent transition-colors duration-300"
      >
        {formData.favIcon ? (
          <img
            src={formData.favIcon}
            alt="Favicon Preview"
            className="w-16 h-16 mt-2 rounded border"
          />
        ) : (
          <>
            <Clip />
            <span className="text-neutral-200 text-sm">
              Click or drag SVG file
            </span>
          </>
        )}
        <input
          name="favIcon"
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
