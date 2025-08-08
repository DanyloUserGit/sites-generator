'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { baseUrl } from '@/utils';
import { useAuth } from '@/hooks/AuthContext';
import Loader from '@/components/ui/loader/Loader';
import Button from '@/components/ui/Button';

export type BlockType =
  | 'Hero'
  | 'Services'
  | 'Benefits'
  | 'CTA'
  | 'Contact'
  | 'Map';

const availableBlocks: BlockType[] = [
  'Hero',
  'Services',
  'Benefits',
  'CTA',
  'Contact',
  'Map',
];

export default function StructureForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('page_id');
  const tab = 'structure'; // зафіксовано
  const token = useAuth();

  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBlock, setNewBlock] = useState<BlockType>('Hero');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/sites/site-page-tab/${id}?tab=${tab}`,
          {
            headers: { Authorization: `Bearer ${token.token}` },
          },
        );
        const data = await res.json();
        setBlocks(data || []);
      } catch (err) {
        console.error('Failed to fetch structure data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const newArr = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= newArr.length) return prev;

      const temp = newArr[index];
      newArr[index] = newArr[newIndex];
      newArr[newIndex] = temp;

      return newArr;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  //   const addBlock = () => {
  //     setBlocks((prev) => [...prev, newBlock]);
  //   };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = {
        sections: JSON.stringify(blocks),
      };
      const res = await fetch(
        `${baseUrl}/api/sites/site-page-tab/${id}?tab=${tab}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.token}`,
          },
          body: JSON.stringify(updates),
        },
      );

      if (!res.ok) throw new Error('Save failed');
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 mt-4 bg-neutral-800 text-white rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Page Structure</h2>
      <ul className="space-y-2 mb-4">
        {blocks.map((block, index) => (
          <li
            key={index}
            className="flex items-center justify-between bg-neutral-700 px-4 py-2 rounded-lg"
          >
            <span className="font-mono">{block}</span>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="default"
                onClick={() => moveBlock(index, 'down')}
                disabled={index === blocks.length - 1}
              >
                ↓
              </Button>
              <Button variant="danger" onClick={() => removeBlock(index)}>
                ✕
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* <div className="flex items-center gap-2 mb-4">
        <select
          value={newBlock}
          onChange={(e) => setNewBlock(e.target.value as BlockType)}
          className="bg-neutral-700 text-white border border-neutral-600 rounded-lg px-3 py-2"
        >
          {availableBlocks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <Button onClick={addBlock} variant="action">
          Add Block
        </Button>
      </div> */}

      <Button onClick={handleSave} className="text-black" variant="action">
        Save Structure
      </Button>
    </div>
  );
}
