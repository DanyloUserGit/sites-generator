import { useAuth } from '@/hooks/AuthContext';
import { baseUrl } from '@/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../Button';
import Typography from '../Typography';
import { useState } from 'react';
import Modal from '../Modal';

export default function LeftNav() {
  const router = useRouter();
  const { id } = router.query;
  const pathname = router.pathname;
  const token = useAuth();
  const isActive = (path: string) => pathname === path;
  const [openDelete, setOpenDelete] = useState(false);

  if (!id || typeof id !== 'string') return null;

  const deleteSite = (id: string) => {
    fetch(`${baseUrl}/api/sites/site/${id}`, {
      headers: { Authorization: `Bearer ${token.token}` },
      method: 'DELETE',
    }).then((res) => {
      if (!res.ok) alert('Error occured');
      router.replace('/');
    });
  };

  return (
    <div className="mt-[16px] border-r-[1px] border-neutral-700 max-w-fit min-h-full">
      <ul>
        <li>
          <Link
            href={`/edit-site/?id=${id}`}
            className={`block p-3 hover:bg-neutral-800 ${isActive('/edit-site') ? 'bg-neutral-700' : ''}`}
          >
            <Typography variant="text">Info</Typography>
          </Link>
        </li>
        <li>
          <Link
            href={`/edit-site/site-pages?id=${id}`}
            className={`block p-3 hover:bg-neutral-800 ${isActive('/edit-site/site-pages') ? 'bg-neutral-700' : ''}`}
          >
            <Typography variant="text">Site pages</Typography>
          </Link>
        </li>
        <li>
          <Link
            href={`/edit-site/deployment?id=${id}`}
            className={`block p-3 hover:bg-neutral-800 ${isActive('/edit-site/deployment') ? 'bg-neutral-700' : ''}`}
          >
            <Typography variant="text">Deployment</Typography>
          </Link>
        </li>
        <li className="mt-[24px] pr-2 flex flex-col gap-2">
          <Button
            onClick={() => {
              router.replace('/');
            }}
            variant="action"
          >
            Dashboard
          </Button>

          <Button variant="danger" onClick={() => setOpenDelete(true)}>
            Delete site
          </Button>
        </li>
      </ul>
      {openDelete && (
        <Modal setOpen={setOpenDelete} deleteSite={() => deleteSite(id)} />
      )}
    </div>
  );
}
