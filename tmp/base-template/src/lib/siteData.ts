import { Page, Site } from '@/types';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

let cachedData: Site | null = null;

function readJson(): Site {
  if (cachedData) return cachedData;

  if (!fs.existsSync(dataFilePath)) {
    throw new Error(`data.json not found at ${dataFilePath}`);
  }

  const raw = fs.readFileSync(dataFilePath, 'utf-8');

  try {
    const parsed: Site = JSON.parse(raw);
    cachedData = parsed;
    return parsed;
  } catch (err) {
    throw new Error('Invalid JSON structure in data.json' + err);
  }
}

export function getSiteData(): Site {
  return readJson();
}

export function getAllSlugs(): string[] {
  const data = getSiteData();
  return data.pages.map((page: Page) => page.slug);
}

export function getPageByName(name: string): Page {
  const data = getSiteData();
  const found = data.pages.find((page) => page.pageName === name);

  if (!found) {
    throw new Error(`Page with slug "${name}" not found`);
  }

  const content = {
    ...found.content,
    benefits: Array.isArray(found.content.benefits)
      ? found.content.benefits
      : JSON.parse(found.content.benefits || '[]'),

    aboutServicesTitle: Array.isArray(found.content.aboutServicesTitle)
      ? found.content.aboutServicesTitle
      : JSON.parse(found.content.aboutServicesTitle || '[]'),

    aboutServicesDescription: Array.isArray(
      found.content.aboutServicesDescription,
    )
      ? found.content.aboutServicesDescription
      : JSON.parse(found.content.aboutServicesDescription || '[]'),
  };

  return {
    ...found,
    content,
  };
}
