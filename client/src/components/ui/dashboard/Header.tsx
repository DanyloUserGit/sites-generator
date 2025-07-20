export default function Header() {
  return (
    <div className="w-full grid grid-cols-4 gap-4 px-4 py-3 border-b border-neutral-700 text-neutral-400 text-[14px] font-semibold uppercase tracking-wide">
      <div className="text-center">City</div>
      <div className="text-center">Services</div>
      <div className="text-center">Language</div>
      <div className="text-center">Created</div>
    </div>
  );
}
