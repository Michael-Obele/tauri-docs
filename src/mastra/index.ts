import { Mastra } from "@mastra/core/mastra";
import { MCPServer } from "@mastra/mcp";
import { listSectionsTool } from "./tools/list-sections";
import { getPageTool } from "./tools/get-page";
import { searchTool } from "./tools/search";
import { getPluginTool } from "./tools/get-plugin";

const tauriDocsServer = new MCPServer({
  id: "tauri-docs-mcp",
  name: "tauri-docs-mcp",
  version: "1.0.0",
  tools: {
    list_sections: listSectionsTool,
    get_page: getPageTool,
    search: searchTool,
    get_plugin: getPluginTool,
  },
});

export const mastra = new Mastra({
  mcpServers: { "tauri-docs": tauriDocsServer },
});
