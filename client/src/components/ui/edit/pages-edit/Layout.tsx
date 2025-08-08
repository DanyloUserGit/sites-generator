import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <div className="flex-1 mt-1 p-3 ">{children}</div>;
}
