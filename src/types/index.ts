export interface SiteData {
  city: string;
  services: string;
  language: string;
}
export interface Navigation {
  slug: string;
  linkName: string;
}
export const HugoFreshFivePages = {
  Home: 'home',
  About: 'about',
  Services: 'services',
  Contact: 'contact',
  Blog: 'blog',
} as const;

export type PageName =
  (typeof HugoFreshFivePages)[keyof typeof HugoFreshFivePages];
export type BlockType =
  | 'Hero'
  | 'Services'
  | 'Benefits'
  | 'CTA'
  | 'Contact'
  | 'Map';
