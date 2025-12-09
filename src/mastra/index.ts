import { Mastra } from "@mastra/core/mastra";
import { MCPServer } from "@mastra/mcp";
import { listSectionsTool } from "./tools/list-sections";
import { getPageTool } from "./tools/get-page";
import { searchTool } from "./tools/search";
import { getPluginTool } from "./tools/get-plugin";
import { fetchLlmsTxt } from "./lib/llms-txt";
import type { ResourceContent, PromptMessage } from "./lib/types";

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

  // Resources provide static documentation metadata
  resources: {
    async listResources() {
      return [
        {
          name: "docs-structure",
          description:
            "Complete documentation structure from llms.txt including all sections and paths",
          uri: "tauri://docs/structure",
          mimeType: "application/json",
        },
        {
          name: "supported-platforms",
          description:
            "List of platforms supported by Tauri (Windows, macOS, Linux, iOS, Android)",
          uri: "tauri://platforms",
          mimeType: "application/json",
        },
      ];
    },

    async getResourceContent({ uri }): Promise<ResourceContent> {
      if (uri === "tauri://docs/structure") {
        const index = await fetchLlmsTxt();
        return {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              sections: index.sections.map((s) => ({
                title: s.title,
                path: s.path,
                url: s.url,
              })),
              totalSections: index.sections.length,
            },
            null,
            2
          ),
        };
      }

      if (uri === "tauri://platforms") {
        return {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              desktop: ["Windows", "macOS", "Linux"],
              mobile: ["iOS", "Android"],
              web: ["Browser (coming soon)"],
            },
            null,
            2
          ),
        };
      }

      throw new Error(`Unknown resource URI: ${uri}`);
    },
  },

  // Prompts guide users through common workflows
  prompts: {
    async listPrompts() {
      return [
        {
          name: "getting-started",
          description:
            "Step-by-step guide to create your first Tauri application",
          arguments: [],
        },
        {
          name: "troubleshooting",
          description: "Common issues and solutions for Tauri development",
          arguments: [
            {
              name: "issue",
              description: "The specific issue you're encountering",
              required: false,
            },
          ],
        },
        {
          name: "plugin-setup",
          description: "Guide to installing and configuring a Tauri plugin",
          arguments: [
            {
              name: "plugin",
              description: "Plugin name (e.g., 'dialog', 'fs', 'http')",
              required: true,
            },
          ],
        },
        {
          name: "migration-v1-to-v2",
          description: "Guide for migrating from Tauri v1 to v2",
          arguments: [],
        },
      ];
    },

    async getPromptMessages({ name, args }): Promise<PromptMessage[]> {
      if (name === "getting-started") {
        return [
          {
            role: "user",
            content: {
              type: "text",
              text: "I want to create a new Tauri application. What are the steps?",
            },
          },
          {
            role: "assistant",
            content: {
              type: "text",
              text: `I'll guide you through creating your first Tauri app:

1. **Prerequisites**: Ensure you have Node.js and Rust installed
   - Use \`list_sections\` to find "start/prerequisites"
   - Use \`get_page\` with path "start/prerequisites" for details

2. **Create Project**: Run the create command
   - Use \`search\` for "create project" to find the exact command
   - Use \`get_page\` with path "start/create-project"

3. **Development**: Learn the dev workflow
   - Use \`get_page\` with path "start/develop"

4. **Build**: Create a production build
   - Use \`get_page\` with path "start/build"

Would you like to explore any of these steps in detail?`,
            },
          },
        ];
      }

      if (name === "troubleshooting") {
        const issue = args?.issue;
        return [
          {
            role: "user",
            content: {
              type: "text",
              text: issue
                ? `I'm experiencing this issue: ${issue}`
                : "I'm having trouble with my Tauri app. How do I debug it?",
            },
          },
          {
            role: "assistant",
            content: {
              type: "text",
              text: `Let me help you troubleshoot${issue ? ` your issue with: ${issue}` : ""}:

1. **Check Common Issues**: Search the documentation
   - Use \`search\` with query "${issue || "troubleshooting common errors"}"

2. **Review Build Errors**: Check build configuration
   - Use \`get_page\` with path "develop/debug"

3. **Plugin Issues**: Verify plugin setup
   - Use \`list_sections\` and look for plugin documentation
   - Use \`get_plugin\` if it's a specific plugin issue

4. **Platform-Specific**: Check platform requirements
   - Use resource "supported-platforms" to verify your target

What specific error or behavior are you seeing?`,
            },
          },
        ];
      }

      if (name === "plugin-setup") {
        const plugin = args?.plugin;
        if (!plugin) {
          throw new Error("plugin argument is required");
        }

        return [
          {
            role: "user",
            content: {
              type: "text",
              text: `How do I set up the ${plugin} plugin?`,
            },
          },
          {
            role: "assistant",
            content: {
              type: "text",
              text: `I'll help you set up the ${plugin} plugin:

1. **Get Plugin Documentation**:
   - Use \`get_plugin\` with name "${plugin}" to get complete setup guide

2. **Installation**: Add to your project
   - The documentation will show the npm/cargo commands

3. **Configuration**: Update permissions
   - Check the capabilities and permissions sections

4. **Usage Examples**: See code examples
   - The plugin docs include practical examples

Let me fetch the documentation for you using \`get_plugin\` with name="${plugin}".`,
            },
          },
        ];
      }

      if (name === "migration-v1-to-v2") {
        return [
          {
            role: "user",
            content: {
              type: "text",
              text: "How do I migrate my Tauri v1 app to v2?",
            },
          },
          {
            role: "assistant",
            content: {
              type: "text",
              text: `I'll guide you through migrating from v1 to v2:

1. **Migration Guide**: Start with the official guide
   - Use \`search\` for "migration v1 v2"
   - Use \`get_page\` to read the migration documentation

2. **Breaking Changes**: Review what changed
   - API changes in core functionality
   - Plugin system updates
   - Configuration format changes

3. **Update Dependencies**: Upgrade packages
   - Update both npm and cargo dependencies

4. **Test Thoroughly**: Verify functionality
   - Test all features after migration

Use \`search\` with query "migration" to find the migration guide.`,
            },
          },
        ];
      }

      throw new Error(`Unknown prompt: ${name}`);
    },
  },
});

export const mastra = new Mastra({
  mcpServers: { "tauri-docs": tauriDocsServer },
});
