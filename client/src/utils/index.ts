export const baseUrl =
  typeof window !== 'undefined'
    ? !location.host.includes('localhost')
      ? `${location.protocol}//${location.host}`
      : 'http://localhost:8000'
    : '';
export const tabs = [
  { key: 'content', label: 'Content' },
  { key: 'seo', label: 'SEO' },
];
