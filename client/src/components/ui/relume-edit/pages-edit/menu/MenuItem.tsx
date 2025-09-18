import Typography from '@/components/ui/Typography';
import { IRelumePage, Page } from '@/types';
import Link from 'next/link';

export default function MenuItem({
  page,
  currentPageId,
  tab,
}: {
  page: IRelumePage;
  currentPageId: string | null;
  tab: string;
}) {
  const isActive = page.id === currentPageId;

  return (
    <Link
      href={`/relume-edit-site/site-pages/?id=${page.site.id}&page_id=${page.id}&tab=${tab}`}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isActive ? 'bg-neutral-600 ' : ' hover:bg-neutral-700 '
      } text-white`}
    >
      <Typography variant="text" className="capitalize">
        {page.name}
      </Typography>
    </Link>
  );
}
