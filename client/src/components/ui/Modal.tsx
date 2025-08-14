import Button from './Button';
import Typography from './Typography';

export default function Modal({
  setOpen,
  deleteSite,
}: {
  setOpen: (s: boolean) => void;
  deleteSite: () => void;
}) {
  return (
    <div className="w-full h-full z-20 bg-black/65 absolute top-0 left-0 flex flex-col items-center">
      <div className="m-auto px-8 py-4 bg-neutral-950 rounded-[8px] border-neutral-800 max-w-fit">
        <Typography variant="title">Delete this website?</Typography>
        <div className="flex mt-4 gap-2">
          <Button className="flex-1" onClick={deleteSite} variant="danger">
            Delete
          </Button>
          <Button
            className="flex-1 text-white"
            onClick={() => setOpen(false)}
            variant="default"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
