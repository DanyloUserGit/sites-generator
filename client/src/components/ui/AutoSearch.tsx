import { useState, useMemo } from 'react';

export default function AutoSearch({
  label,
  list,
  value,
  setValue,
}: {
  label: string;
  list: string[];
  value: string;
  setValue: (s: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!value) return [];
    return list
      .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 2);
  }, [value, list]);

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-neutral-200 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-50 placeholder-neutral-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Почніть вводити..."
        />
        {focused && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onMouseDown={() => setValue(s)}
                className="cursor-pointer px-3 py-2 text-neutral-50 hover:bg-accent hover:text-white rounded-lg"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
