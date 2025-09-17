export type TypographyVariants = 'title' | 'text';
export type ButtonVariants = 'action' | 'default' | 'danger';
export interface Site {
  id: string;
  city: string;
  services: string;
  language: string;
  domain: string;
  createdAt: string;
}
export interface Page {
  id: string;
  pageName: string;
  slug: string;
  updatedAt: string;
  site: SiteExtended;
  seo_id: string;
  content_id: string;
}
export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  schemaOrg: Record<string, string>;
}
export interface PageContent {
  heroTitle: string;
  heroDescription: string;
  heroCtaText: string;
  benefits: string[];
  formText: string;
  backgroundImageUrl: string;
  mapImageUrl?: string;
  heroCtaImg: string;
  ctaDescription: string;
  aboutServicesTitle: string[];
  aboutServicesDescription: string[];
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
  heroCtaUrl: string;
}
export type BlockType =
  | 'Hero'
  | 'Services'
  | 'Benefits'
  | 'CTA'
  | 'Contact'
  | 'Map';
export const siteMethods = [
  'All websites',
  'Relume',
  'Default template',
] as const;

export type SiteMethod = (typeof siteMethods)[number];
