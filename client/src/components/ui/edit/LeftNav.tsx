import Link from 'next/link';
import { useRouter } from 'next/router';
import Typography from '../Typography';
import { usePathname } from 'next/navigation';
import Button from '../Button';
import { baseUrl } from '@/utils';
import { useAuth } from '@/hooks/AuthContext';

export default function LeftNav() {
  const router = useRouter();
  const { id } = router.query;
  const pathname = router.pathname;
  const token = useAuth();
  const isActive = (path: string) => pathname === path;

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
        <li className="mt-[24px] pr-2">
          <Button variant="danger" onClick={() => deleteSite(id)}>
            Delete site
          </Button>
        </li>
      </ul>
    </div>
  );
}
