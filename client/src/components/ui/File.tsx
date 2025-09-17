import { useEffect, useState } from 'react';
import Clip from '../svg/Clip';

export default function File({
  onFileChange,
  fileRef,
  text,
  format,
}: {
  onFileChange: (file: File | null) => void;
  fileRef: File | null;
  text: string;
  format: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file ? file.name : null);
    onFileChange(file);
  };

  useEffect(() => {
    if (!fileRef) {
      setFileName(null);
      setInputKey((prev) => prev + 1);
    }
  }, [fileRef]);

  return (
    <div className="w-full p-4 bg-neutral-800 rounded-2xl flex items-center justify-center">
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex gap-[8px] items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-neutral-500 hover:border-accent transition-colors duration-300"
      >
        {fileName ? (
          <span className="text-neutral-200 text-sm">{fileName}</span>
        ) : (
          <>
            <Clip />
            <span className="text-neutral-200 text-sm">{text}</span>
          </>
        )}
        <input
          key={inputKey}
          id="file-upload"
          type="file"
          accept={format}
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
