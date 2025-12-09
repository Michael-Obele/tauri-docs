export type DocSection = {
  title: string;
  path: string;
  url: string;
};

export type DocsIndex = {
  sections: DocSection[];
  raw: string;
};

const INDEX_URL = "https://tauri.app/llms.txt";

export async function fetchLlmsTxt(): Promise<DocsIndex> {
  const res = await fetch(INDEX_URL);
  if (!res.ok) throw new Error(`Failed to fetch llms.txt: ${res.status}`);
  const raw = await res.text();

  const sections = parseLlmsTxt(raw);

  return { sections, raw };
}

export function parseLlmsTxt(raw: string): DocSection[] {
  const lines = raw.split(/\r?\n/);
  const sections: DocSection[] = [];

  for (const line of lines) {
    const pageMatch = line.match(/^-\s*\[(.+?)\]\((https?:\/\/[^)]+)\)/);
    if (pageMatch) {
      const [, title, url] = pageMatch;
      const path = url.replace("https://v2.tauri.app/", "").replace(/\/$/, "");
      sections.push({
        title: title.trim(),
        path,
        url: url.trim(),
      });
    }
  }

  return sections;
}
