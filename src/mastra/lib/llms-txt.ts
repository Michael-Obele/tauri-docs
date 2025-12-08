import { getCached } from './cache';

export type DocsSection = {
  category: string;
  pages: { title: string; path: string; description?: string }[];
};

const INDEX_URL = 'https://tauri.app/llms.txt';
const INDEX_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function fetchDocsIndex(): Promise<string> {
  return getCached('llms.txt', INDEX_TTL_MS, async () => {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`Failed to fetch llms.txt: ${res.status}`);
    return res.text();
  });
}

export function parseDocsIndex(raw: string): DocsSection[] {
  const lines = raw.split(/\r?\n/);
  const sections: DocsSection[] = [];
  let current: DocsSection | null = null;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)/);
    if (heading) {
      current = { category: heading[1].trim(), pages: [] };
      sections.push(current);
      continue;
    }

    const pageMatch = line.match(/^-\s*\[(.+?)\]\((https?:\/\/[^)]+)\)/);
    if (pageMatch && current) {
      const [, title, url] = pageMatch;
      const path = url.replace('https://v2.tauri.app/', '').replace(/\/$/, '');
      current.pages.push({ title: title.trim(), path });
    }
  }

  return sections;
}
