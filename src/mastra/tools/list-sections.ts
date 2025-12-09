import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchLlmsTxt } from "../lib/llms-txt";
import { indexCache } from "../lib/cache-manager";
import type { Section } from "../lib/types";

type ListSectionsResult = {
  sections: { title: string; path: string; url: string }[];
  totalSections: number;
};

export const listSectionsTool = createTool({
  id: "list_sections",
  description: "List all available Tauri documentation sections from llms.txt",
  inputSchema: z.object({}),
  outputSchema: z.object({
    sections: z.array(
      z.object({
        title: z.string(),
        path: z.string(),
        url: z.string(),
      })
    ),
    totalSections: z.number(),
  }),
  execute: async () => {
    // Try cache first
    const cached = indexCache.get<ListSectionsResult>("docs-index");
    if (cached) {
      return cached;
    }

    // Fetch fresh data
    const index = await fetchLlmsTxt();
    const sections: Section[] = index.sections.map((s) => ({
      title: s.title,
      path: s.path,
    }));

    const result = {
      sections: sections.map((s) => ({
        title: s.title,
        path: s.path,
        url: `https://v2.tauri.app/${s.path}`,
      })),
      totalSections: sections.length,
    };

    // Cache result
    indexCache.set("docs-index", result);

    return result;
  },
});
