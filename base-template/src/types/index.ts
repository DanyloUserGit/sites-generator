export interface PageSeo {
  id: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  schemaOrg: Record<string, unknown>;
  updatedAt: string;
}
export interface NavLink {
  slug: string;
  linkName: string;
}
export interface PageContent {
  id: string;
  heroTitle: string;
  heroDescription: string;
  heroCtaText: string;
  ctaDescription: string;
  findUsText: string | null;
  contactNameText: string | null;
  contactMessageText: string | null;
  benefitsTitle: string;
  benefits: string[];
  aboutServicesTitle: string[];
  aboutServicesDescription: string[];
  formText: string | null;
  backgroundImageUrl: string;
  heroCtaImg: string;
  mapImageUrl?: string | null;
  updatedAt: string;
}

export interface Page {
  id: string;
  slug: string;
  pageName: string;
  updatedAt: string;
  seo: PageSeo;
  content: PageContent;
  sections: string[];
}

export interface Site {
  id: string;
  companyName: string;
  city: string;
  services: string;
  language: string;
  heroCtaUrl: string;
  slug: string;
  favIcon: string;
  usedUnsplashIds: string[];
  createdAt: string;
  updatedAt: string;
  navigation: NavLink[];
  pages: Page[];
  domain: string;
}
const HugoFreshFivePages = {
  Home: 'home',
  About: 'about',
  Services: 'services',
  Contact: 'contact',
  Blog: 'blog',
} as const;
export type HugoFreshFivePages = keyof typeof HugoFreshFivePages;
export type BlockType =
  | 'Hero'
  | 'Services'
  | 'Benefits'
  | 'CTA'
  | 'Contact'
  | 'Map';
export interface PageProps {
  page: Page;
  site: Site;
}
