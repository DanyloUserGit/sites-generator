export type TypographyVariants = 'title' | 'text';
export type ButtonVariants = 'action' | 'default';
export interface Site {
  id: string;
  city: string;
  services: string;
  language: string;
  createdAt: string;
}
export interface Status {
  status: string;
  isError: boolean;
  isCompleted: boolean;
}
