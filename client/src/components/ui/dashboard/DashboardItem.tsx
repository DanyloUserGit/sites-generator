import { useRouter } from 'next/router';

export default function DashboardItem({
  city,
  services,
  language,
  createdAt,
  relume,
  id,
}: {
  id: string;
  city: string;
  services: string;
  language: string;
  relume: boolean | undefined;
  createdAt: string;
}) {
  const router = useRouter();
  const manageSite = () => {
    if (!relume) router.push(`/edit-site?id=${id}`);
    if (relume) router.push(`/relume-edit-site?id=${id}`);
  };
  return (
    <div
      onClick={manageSite}
      className="w-full cursor-pointer grid grid-cols-4 gap-4 px-4 py-3 border-b border-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm"
    >
      <div className="text-center">{city}</div>
      <div className="text-center">{services}</div>
      <div className="text-center">{language}</div>
      <div className="text-center text-neutral-400">
        {new Date(createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
