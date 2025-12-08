# Tauri Docs MCP Server

> A cloud-hosted MCP server providing AI assistants with comprehensive access to Tauri documentation, accessible via HTTP without local installation. Deployed on Mastra Cloud.

[Notes](./notes.md) | [TODOs](./todos.md)

---

## Deployment Target: Mastra Cloud

**Cloud-hosted via Mastra Cloud** - Connect via HTTP/SSE endpoint, no local installation required:

```json
{
  "mcpServers": {
    "tauri-docs": {
      "url": "https://tauri-docs-mcp.mastra.cloud/mcp"
    }
  }
}
```

This eliminates the need for `npx` installation and works in restricted environments.

---

## Problem Statement

Tauri 2.0 is a modern framework for building cross-platform desktop and mobile applications, but AI assistants often lack current knowledge about its APIs, patterns, and best practices. Existing Tauri MCP servers focus on **debugging running applications** (screenshots, DOM access, window manipulation) rather than providing **documentation access** for building apps.

## Gap Analysis: Existing Tauri MCPs

| MCP Server                    | Focus     | What It Does                                                                                          |
| ----------------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `dirvine/tauri-mcp`           | Debugging | Testing/interacting with running Tauri v2 apps (12 tools for process management, window manipulation) |
| `P3GLEG/tauri-plugin-mcp`     | Debugging | Plugin for AI agents to debug within Tauri apps (screenshots, DOM, localStorage)                      |
| `@hypothesi/tauri-mcp-server` | Debugging | Build, test, debug running apps with screenshots and console logs                                     |

**Gap Identified:** No MCP server exists for accessing Tauri documentation to help AI understand HOW to build Tauri apps.

## Solution

Build a documentation-focused MCP server using Mastra.ai that:

1. Fetches Tauri's `llms.txt` index for structured documentation access
2. Retrieves specific documentation pages on demand
3. Searches documentation for relevant topics
4. Provides focused plugin documentation

## Key Discovery: No JS Rendering Needed

The Tauri documentation site (built with Astro + Starlight) is **fully static** and renders without JavaScript. Simple `fetch` requests work perfectly, making this serverless-compatible without needing Puppeteer or browser rendering.

**Bonus:** Tauri provides an `llms.txt` file at `https://tauri.app/llms.txt` with a complete documentation index designed for LLM consumption.

---

## Tool Design (4 Tools)

### 1. `list_sections`

**Purpose:** Get the full documentation structure and available sections

**Input:** None required

**Output:** Parsed index from llms.txt with categories:

- Start (prerequisites, create project, frontend config)
- Concepts (architecture, IPC, process model)
- Security (capabilities, permissions, CSP)
- Develop (calling Rust, plugins, debugging)
- Distribute (app stores, code signing, installers)
- Learn (tutorials, window customization, system tray)
- Plugins (all official plugin documentation)

**Implementation:**

```typescript
const listSectionsTool = createTool({
  id: "list_sections",
  description: "List all available Tauri documentation sections and categories",
  inputSchema: z.object({}),
  outputSchema: z.object({
    sections: z.array(
      z.object({
        category: z.string(),
        pages: z.array(
          z.object({
            title: z.string(),
            path: z.string(),
            description: z.string().optional(),
          })
        ),
      })
    ),
  }),
  execute: async () => {
    const response = await fetch("https://tauri.app/llms.txt");
    const text = await response.text();
    return { sections: parseDocsIndex(text) };
  },
});
```

### 2. `get_page`

**Purpose:** Fetch full content of a specific documentation page

**Input:**

- `path` (string): Documentation path, e.g., `"start/create-project"`, `"develop/plugins"`, `"security/capabilities"`

**Output:** Full markdown content of the page

**Implementation:**

```typescript
const getPageTool = createTool({
  id: "get_page",
  description: "Get the full content of a Tauri documentation page by path",
  inputSchema: z.object({
    path: z
      .string()
      .describe(
        "Documentation path like 'start/create-project' or 'develop/plugins'"
      ),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const url = `https://v2.tauri.app/${context.path}`;
    const response = await fetch(url);
    const html = await response.text();
    const content = extractMainContent(html);
    return { title: extractTitle(html), content, url };
  },
});
```

### 3. `search`

**Purpose:** Search documentation for relevant pages by keywords

**Input:**

- `query` (string): Search terms

**Output:** List of matching pages with titles, paths, and relevance snippets

**Implementation:**

```typescript
const searchTool = createTool({
  id: "search",
  description: "Search Tauri documentation for pages matching a query",
  inputSchema: z.object({
    query: z.string().describe("Search terms to find in documentation"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        path: z.string(),
        snippet: z.string(),
        relevance: z.number(),
      })
    ),
  }),
  execute: async ({ context }) => {
    // Fetch index, filter by keywords, rank by relevance
    const index = await fetchDocsIndex();
    const results = searchIndex(index, context.query);
    return { results };
  },
});
```

### 4. `get_plugin`

**Purpose:** Get detailed documentation for a specific Tauri plugin

**Input:**

- `name` (string): Plugin name, e.g., `"dialog"`, `"fs"`, `"store"`, `"http"`

**Output:** Plugin documentation including setup, usage (JS + Rust), and permissions

**Implementation:**

```typescript
const getPluginTool = createTool({
  id: "get_plugin",
  description:
    "Get documentation for a specific Tauri plugin including setup, usage examples, and permissions",
  inputSchema: z.object({
    name: z
      .string()
      .describe("Plugin name like 'dialog', 'fs', 'store', 'http'"),
  }),
  outputSchema: z.object({
    name: z.string(),
    description: z.string(),
    platforms: z.array(z.string()),
    setup: z.string(),
    jsUsage: z.string(),
    rustUsage: z.string(),
    permissions: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const url = `https://v2.tauri.app/plugin/${context.name}`;
    const response = await fetch(url);
    const html = await response.text();
    return parsePluginDoc(html);
  },
});
```

---

## Project Structure (Full Mastra App)

```
tauri-docs-mcp/
├── src/
│   └── mastra/
│       ├── tools/
│       │   ├── list-sections.ts
│       │   ├── get-page.ts
│       │   ├── search.ts
│       │   └── get-plugin.ts
│       ├── lib/
│       │   ├── parsers.ts      # HTML parsing utilities
│       │   ├── cache.ts        # In-memory caching
│       │   └── llms-txt.ts     # llms.txt parser
│       └── index.ts            # Mastra entry point with MCPServer
├── package.json
├── tsconfig.json
└── README.md
```

### Entry Point (src/mastra/index.ts)

```typescript
import { Mastra } from "@mastra/core/mastra";
import { MCPServer } from "@mastra/mcp";
import { listSectionsTool } from "./tools/list-sections";
import { getPageTool } from "./tools/get-page";
import { searchTool } from "./tools/search";
import { getPluginTool } from "./tools/get-plugin";

// Create MCP Server with all 4 tools
const mcpServer = new MCPServer({
  name: "tauri-docs-mcp",
  version: "1.0.0",
  description:
    "Cloud-hosted MCP server providing access to Tauri documentation",
  tools: {
    list_sections: listSectionsTool,
    get_page: getPageTool,
    search: searchTool,
    get_plugin: getPluginTool,
  },
});

// Export Mastra instance with MCP server
export const mastra = new Mastra({
  mcpServers: { "tauri-docs": mcpServer },
});
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Client                           │
│         (Claude, Cursor, VS Code, etc.)                 │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP/SSE (MCP Protocol)
┌─────────────────────────▼───────────────────────────────┐
│                   Mastra Cloud                          │
│         https://tauri-docs-mcp.mastra.cloud             │
├─────────────────────────────────────────────────────────┤
│                  tauri-docs-mcp                         │
│              (Mastra.ai Application)                    │
├─────────────────────────────────────────────────────────┤
│  Tools:                                                 │
│  • list_sections - Get docs structure                   │
│  • get_page - Fetch specific page                       │
│  • search - Search documentation                        │
│  • get_plugin - Get plugin details                      │
├─────────────────────────────────────────────────────────┤
│  Implementation:                                        │
│  • Native fetch (serverless-compatible)                 │
│  • HTML-to-Markdown parsing                             │
│  • In-memory caching for performance                    │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP requests
┌─────────────────────────▼───────────────────────────────┐
│              Tauri Documentation                        │
│  • https://tauri.app/llms.txt (index)                   │
│  • https://v2.tauri.app/* (pages)                       │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component    | Choice       | Reason                                        |
| ------------ | ------------ | --------------------------------------------- |
| Runtime      | Bun          | Fast, native TypeScript, good fetch support   |
| Framework    | Mastra.ai    | Full app framework with MCPServer integration |
| Deployment   | Mastra Cloud | Zero-config, auto-scaling, HTTP/SSE endpoints |
| HTML Parsing | cheerio      | Fast, jQuery-like HTML parsing                |
| Validation   | Zod          | Schema validation for tool inputs/outputs     |

---

## Success Criteria

1. **Cloud-Hosted:** Accessible via HTTP/SSE at Mastra Cloud URL
2. **No Installation:** Users connect via URL, no npx/npm required
3. **Functional:** All 4 tools work correctly and return accurate documentation
4. **Performance:** Response time < 2s for page fetches
5. **Accuracy:** Content matches official Tauri docs

---

## Companion MCP: Rust Documentation

Tauri apps require both framework knowledge (covered by this MCP) and Rust language/API documentation for backend code. We also build **rust-docs-mcp** as a companion, both deployed on Mastra Cloud.

### Why Separate MCPs?

| Concern    | tauri-docs-mcp          | rust-docs-mcp          |
| ---------- | ----------------------- | ---------------------- |
| Focus      | Tauri framework         | Rust language & crates |
| Source     | tauri.app, v2.tauri.app | docs.rs                |
| Tool count | 4 (focused)             | 4 (focused)            |
| Deployment | Mastra Cloud            | Mastra Cloud           |

### Combined Configuration (Cloud-Hosted)

For AI assistants building Tauri apps, configure both MCPs via HTTP:

```json
{
  "mcpServers": {
    "tauri-docs": {
      "url": "https://tauri-docs-mcp.mastra.cloud/mcp"
    },
    "rust-docs": {
      "url": "https://rust-docs-mcp.mastra.cloud/mcp"
    }
  }
}
```

### rust-docs-mcp Tools

The companion provides 4 specialized tools:

- `search_crates` - Search crates.io
- `get_crate_overview` - Get crate documentation overview
- `get_item_docs` - Get struct/enum/trait/function documentation
- `list_modules` - List crate modules and items

See [rust-docs-mcp plan](../rust-docs-mcp/index.md) for full details.

This separation keeps both MCPs lean while giving AI assistants complete coverage for Tauri development.

---

## Deployment on Mastra Cloud

### Setup Steps

1. Push code to GitHub
2. Connect repository to Mastra Cloud
3. Mastra Cloud auto-detects MCP server configuration
4. Deploys and provides HTTP/SSE endpoints

### Client Configuration

```json
{
  "mcpServers": {
    "tauri-docs": {
      "url": "https://tauri-docs-mcp.mastra.cloud/mcp"
    }
  }
}
```

### IDE Snippets (Auto-generated by Mastra Cloud)

**Cursor:**

```json
{
  "mcpServers": {
    "tauri-docs": {
      "url": "https://tauri-docs-mcp.mastra.cloud/sse"
    }
  }
}
```

**VS Code:**

```json
{
  "servers": {
    "tauri-docs": {
      "type": "sse",
      "url": "https://tauri-docs-mcp.mastra.cloud/sse"
    }
  }
}
```

---

## Related Documents

- [Notes](./notes.md) - Research findings and technical details
- [TODOs](./todos.md) - Implementation tasks
