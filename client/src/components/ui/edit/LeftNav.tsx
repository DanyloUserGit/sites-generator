import Link from 'next/link';
import { useRouter } from 'next/router';
import Typography from '../Typography';

export default function LeftNav() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') return null;

  return (
    <div className="mt-[16px] border-r-[1px] border-neutral-700 max-w-fit min-h-full">
      <ul>
        <li>
          <Link
            href={`/edit-site/site-info?id=${id}`}
            className="block p-3 hover:bg-neutral-800"
          >
            <Typography variant="text">Info</Typography>
          </Link>
        </li>
        <li>
          <Link
            href={`/edit-site/site-pages?id=${id}`}
            className="block p-3 hover:bg-neutral-800"
          >
            <Typography variant="text">Site pages</Typography>
          </Link>
        </li>
        <li>
          <Link
            href={`/edit-site/site-media?id=${id}`}
            className="block p-3 hover:bg-neutral-800"
          >
            <Typography variant="text">Site media</Typography>
          </Link>
        </li>
      </ul>
    </div>
  );
}
