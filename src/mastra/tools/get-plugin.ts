import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchPageHtml } from "../lib/html";
import { pageCache } from "../lib/cache-manager";
import type { PluginContent } from "../lib/types";

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
    content: z.string().describe("HTML content of the plugin documentation"),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const path = `plugin/${context.name.replace(/^\//, "")}`;
    const url = `https://v2.tauri.app/${path}`;

    // Try cache first
    const cacheKey = `plugin:${url}`;
    const cached = pageCache.get<PluginContent>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch fresh data
    const page = await fetchPageHtml(url);
    const result: PluginContent = {
      title: page.title,
      content: page.html,
      url: page.url,
    };

    // Cache result
    pageCache.set(cacheKey, result);

    return result;
  },
});
