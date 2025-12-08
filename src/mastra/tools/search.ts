import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchDocsIndex, parseDocsIndex } from "../lib/llms-txt";

export const searchTool = createTool({
  id: "search",
  description: "Search Tauri documentation index by keywords",
  inputSchema: z.object({
    query: z.string().min(2).describe("Keywords to search for"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        path: z.string(),
        score: z.number(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const raw = await fetchDocsIndex();
    const sections = parseDocsIndex(raw);
    const terms = context.query.toLowerCase().split(/\s+/).filter(Boolean);

    const results: { title: string; path: string; score: number }[] = [];

    sections.forEach((section) => {
      section.pages.forEach((page) => {
        const haystack = `${page.title} ${page.path}`.toLowerCase();
        const score = terms.reduce(
          (acc, term) => (haystack.includes(term) ? acc + 1 : acc),
          0
        );
        if (score > 0) {
          results.push({ title: page.title, path: page.path, score });
        }
      });
    });

    results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

    return { results };
  },
});
