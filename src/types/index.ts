export interface SiteData {
  city: string;
  services: string;
  language: string;
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
