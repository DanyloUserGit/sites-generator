export type TypographyVariants = 'title' | 'text';
export type ButtonVariants = 'action' | 'default' | 'danger';
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
export interface SiteExtended extends Site {
  companyName: string;
  slug: string;
  favIcon: string;
  updatedAt: string;
}
