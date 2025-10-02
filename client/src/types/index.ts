export type TypographyVariants = 'title' | 'text';
export type ButtonVariants = 'action' | 'default' | 'danger';
export interface Site {
  id: string;
  city: string;
  services: string;
  language: string;
  domain: string;
  relume?: boolean;
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
export interface IRelumeSite {
  id: string;
  name: string;
  companyName?: string | null;
  city: string;
  services: string;
  language: string;
  deployUrl?: string | null;
  siteUrl?: string | null;
  pages: IRelumePage[];
  domain?: string | null;
  projectId?: string | null;
  relume: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRelumePage {
  id: string;
  seo: IRelumePageSeo;
  name: string;
  site: IRelumeSite;
  tags: ITag[];
}

export interface IRelumePageSeo {
  id: string;
  page: IRelumePage;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[] | null;
  schemaOrg?: Record<string, string> | null;
  updatedAt: Date;
}

export interface ITag {
  id: string;
  type: string;
  value: string;
  page: IRelumePage;
  position: number;
}
