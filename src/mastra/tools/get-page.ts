import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchPageHtml } from "../lib/html";
import { pageCache } from "../lib/cache-manager";
import type { PageContent } from "../lib/types";

export const getPageTool = createTool({
  id: "get_page",
  description:
    "Fetch a specific Tauri documentation page by path and return HTML content",
  inputSchema: z.object({
    path: z
      .string()
      .describe("Path like 'start/create-project' or 'develop/plugins'"),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string().describe("HTML content of the documentation page"),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const { path } = context;
    const url = path.startsWith("http")
      ? path
      : `https://v2.tauri.app/${path.replace(/^\//, "")}`;

    // Try cache first
    const cacheKey = `page:${url}`;
    const cached = pageCache.get<PageContent>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch fresh data
    const page = await fetchPageHtml(url);
    const result: PageContent = {
      title: page.title,
      content: page.html,
      url: page.url,
    };

    // Cache result
    pageCache.set(cacheKey, result);

    return result;
  },
});
