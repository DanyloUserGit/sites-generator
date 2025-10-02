import { useRouter } from 'next/router';
import Plus from './svg/Plus';
import Button from './ui/Button';
import Typography from './ui/Typography';
import Settings from './svg/Settings';

export default function Header() {
  const router = useRouter();
  const createNew = () => {
    router.push('/create-site');
  };
  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex gap-2 items-center mb-2">
        {' '}
        <button className="text-white" onClick={() => router.push('/settings')}>
          <Settings />
        </button>
        <Typography variant="title">Websites</Typography>
      </div>
      <Button onClick={createNew}>
        <Typography className="flex gap-[8px] items-center" variant="text">
          <Plus /> Add new
        </Typography>
      </Button>
    </div>
  );
}
