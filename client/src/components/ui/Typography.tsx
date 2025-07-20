import { TypographyVariants } from '@/types';
import { ReactNode, useState } from 'react';

export default function Typography({
  children,
  variant,
  className = '',
}: {
  children: ReactNode;
  variant: TypographyVariants;
  className?: string;
}) {
  const size = variant === 'title' ? 22 : 16;
  return (
    <span
      className={` text-white ${variant == 'title' ? 'font-[600]' : 'font-normal'} ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      {children}
    </span>
  );
}
