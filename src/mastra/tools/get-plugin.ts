import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchPageMarkdown } from "../lib/html";
import { getCached } from "../lib/cache";

const PAGE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const getPluginTool = createTool({
  id: "get_plugin",
  description: "Get documentation for a specific Tauri plugin by name",
  inputSchema: z.object({
    name: z
      .string()
      .min(1)
      .describe("Plugin name like 'dialog', 'fs', 'store', 'http'"),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const path = `plugin/${context.name.replace(/^\//, "")}`;
    const url = `https://v2.tauri.app/${path}`;

    const page = await getCached(`plugin:${url}`, PAGE_TTL_MS, () =>
      fetchPageMarkdown(url)
    );

    return { title: page.title, content: page.markdown, url: page.url };
  },
});
