import { useRouter } from 'next/router';
import Plus from './svg/Plus';
import Button from './ui/Button';
import Typography from './ui/Typography';
import { removeToken } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const createNew = () => {
    router.push('/create-site');
  };
  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };
  return (
    <div className="w-full flex justify-between items-center">
      <div onClick={handleLogout}>
        <Typography variant="title">All websites</Typography>
      </div>
      <Button onClick={createNew}>
        <Typography className="flex gap-[8px] items-center" variant="text">
          <Plus /> Add new
        </Typography>
      </Button>
    </div>
  );
}
