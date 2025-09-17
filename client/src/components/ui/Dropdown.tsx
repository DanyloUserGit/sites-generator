import { SiteMethod } from '@/types';
import { useState } from 'react';

interface DropdownProps {
  label: string;
  items: { label: string; value: string }[];
  onSelect?: (value: SiteMethod) => void;
}

export default function Dropdown({ label, items, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: SiteMethod) => {
    onSelect?.(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-primary text-white px-4 py-2 rounded-2xl shadow hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {label}
      </button>

      {isOpen && (
        <ul className="absolute mt-2 w-48 bg-neutral-800 border border-neutral-600 rounded-2xl shadow-lg overflow-hidden z-10">
          {items.map((item) => (
            <li key={item.value}>
              <button
                onClick={() => handleSelect(item.value as SiteMethod)}
                className="block w-full text-left px-4 py-2 text-neutral-100 hover:bg-accent hover:text-white transition-colors"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
