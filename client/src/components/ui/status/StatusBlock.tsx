import { Status } from '@/types';
import Typography from '../Typography';

export default function StatusBlock({ status }: { status: Status }) {
  return (
    <div className="flex gap-[12px]">
      <div
        className={`w-[24px] h-[24px] rounded-[50%] ${!status.isCompleted ? 'bg-accent' : 'bg-success'}
        ${status.isError ? 'bg-danger' : ''}`}
      />
      <Typography variant="text">{status.status}</Typography>
    </div>
  );
}
