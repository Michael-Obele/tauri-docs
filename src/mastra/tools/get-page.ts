import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchPageMarkdown } from "../lib/html";
import { getCached } from "../lib/cache";

const PAGE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const getPageTool = createTool({
  id: "get_page",
  description:
    "Fetch a specific Tauri documentation page by path and return markdown",
  inputSchema: z.object({
    path: z
      .string()
      .describe("Path like 'start/create-project' or 'develop/plugins'"),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const { path } = context;
    const url = path.startsWith("http")
      ? path
      : `https://v2.tauri.app/${path.replace(/^\//, "")}`;

    const page = await getCached(`page:${url}`, PAGE_TTL_MS, () =>
      fetchPageMarkdown(url)
    );

    return { title: page.title, content: page.markdown, url: page.url };
  },
});
