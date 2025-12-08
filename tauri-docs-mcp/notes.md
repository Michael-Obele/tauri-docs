# Tauri Docs MCP - Research Notes

[← Back to Index](./index.md)

---

## Research Findings

### Tauri Documentation Analysis

**Site Technology:**

- Built with Astro v5.15.9 + Starlight v0.36.0
- Fully static site - **no JavaScript required for content**
- Clean markdown content easily extractable
- Good semantic HTML structure

**URL Structure:**

- Main site: `https://tauri.app/` (landing page)
- Docs v2: `https://v2.tauri.app/` (current docs)
- Docs v1: `https://v1.tauri.app/` (legacy)

**Key Discovery: llms.txt**

Tauri provides an LLM-friendly index at `https://tauri.app/llms.txt` containing:

- Full documentation structure
- Direct links to all pages
- Organized by category (Start, Concept, Security, Develop, Distribute, Learn)

### llms.txt Content Structure

```markdown
# Tauri Full Documentation

## Start

- [What is Tauri?](https://v2.tauri.app/start)
- [Create a Project](https://v2.tauri.app/start/create-project)
- [Prerequisites](https://v2.tauri.app/start/prerequisites)
- [Frontend Configuration](https://v2.tauri.app/start/frontend)
  - [Next.js](https://v2.tauri.app/start/frontend/nextjs)
  - [SvelteKit](https://v2.tauri.app/start/frontend/sveltekit)
  - [Vite](https://v2.tauri.app/start/frontend/vite)
    ...

## Concept

- [Tauri Architecture](https://v2.tauri.app/concept/architecture)
- [Inter-Process Communication](https://v2.tauri.app/concept/inter-process-communication)
  ...

## Security

- [Capabilities](https://v2.tauri.app/security/capabilities)
- [Permissions](https://v2.tauri.app/security/permissions)
  ...

## Develop

- [Calling Rust from the Frontend](https://v2.tauri.app/develop/calling-rust)
- [Plugin Development](https://v2.tauri.app/develop/plugins)
  ...

## Distribute

- [App Store](https://v2.tauri.app/distribute/app-store)
- [Google Play](https://v2.tauri.app/distribute/google-play)
  ...

## Learn

- [System Tray](https://v2.tauri.app/learn/system-tray)
- [Window Customization](https://v2.tauri.app/learn/window-customization)
  ...
```

---

## Existing Tauri MCP Servers

### 1. dirvine/tauri-mcp (Rust)

- **GitHub:** https://github.com/dirvine/tauri-mcp
- **crates.io:** https://crates.io/crates/tauri-mcp
- **Purpose:** Testing and interacting with running Tauri v2 apps
- **Transport:** JSON-RPC 2.0 over stdio
- **Tools (12):** Process management, window manipulation, debugging
- **Not for:** Documentation access

### 2. P3GLEG/tauri-plugin-mcp

- **GitHub:** https://github.com/P3GLEG/tauri-plugin-mcp
- **Purpose:** Tauri plugin + MCP server for AI debugging
- **Features:**
  - Take screenshots of Tauri windows
  - Window management (position, size, focus)
  - DOM access from webviews
  - Mouse/text simulation
  - localStorage management
- **Not for:** Documentation access

### 3. @hypothesi/tauri-mcp-server

- **NPM:** `npx -y @hypothesi/tauri-mcp-server`
- **Purpose:** Build, test, debug Tauri apps
- **Features:** Screenshots, DOM state, console logs
- **Not for:** Documentation access

### Gap Confirmed

All existing MCPs focus on runtime debugging/interaction, NOT documentation for building apps.

---

## Rust Documentation Strategy

### The Question

Tauri apps require Rust for the backend. AI assistants need access to Rust API docs to write correct Rust code. Should we:

- A) Add a 5th tool to tauri-docs-mcp?
- B) Build a separate rust-docs-mcp?
- C) Recommend existing solutions?

### Existing Rust Docs MCPs

**1. laptou/rust-docs-mcp-server** (Recommended)

- **GitHub:** https://github.com/laptou/rust-docs-mcp-server
- **Runtime:** Bun (can also run with Node.js)
- **Features (7 tools):**
  - Search for crates on docs.rs
  - Get documentation for specific crates and versions
  - Get type information (structs, enums, traits)
  - Get feature flags for crates
  - Get available versions
  - Get source code for specific items
  - Search for symbols within crates
- **Coverage:** ALL crates on docs.rs (including tauri, tauri-plugin-\*, serde, tokio, etc.)

**2. 0xkoda/mcp-rust-docs**

- **GitHub:** https://github.com/0xkoda/mcp-rust-docs
- **Purpose:** Simpler version - fetches and formats docs.rs content
- **Features:** Strips HTML, formats for readability

### docs.rs Analysis

docs.rs pages are fully static and scrapeable:

- Rich content: modules, structs, enums, traits, functions
- Cargo features documentation
- Re-exports and dependencies
- 100% coverage for tauri crate

Example scraped content from `https://docs.rs/tauri/latest/tauri/`:

- All Cargo features explained
- Complete API: Builder, App, AppHandle, Window, Webview
- Modules: async_runtime, menu, plugin, webview, window
- Macros: generate_handler, generate_context
- All traits: Manager, Emitter, Listener, Runtime

### Recommendation: Use Existing + Stay Focused

**Keep tauri-docs-mcp at 4 tools and recommend laptou/rust-docs-mcp-server alongside.**

| MCP                           | Focus                                               | Tools |
| ----------------------------- | --------------------------------------------------- | ----- |
| tauri-docs-mcp (ours)         | Framework guides, tutorials, plugin setup, security | 4     |
| rust-docs-mcp-server (laptou) | Rust API reference for all crates                   | 7     |

**Combined benefits:**

- Complete coverage: framework concepts + Rust APIs
- No duplication of effort
- Leverages well-maintained existing solution
- Stays true to 4-tool philosophy
- Less maintenance burden

### Alternative: 5th Tool Approach

If you want a single MCP for all Tauri needs, you could add:

```typescript
const getRustApiTool = createTool({
  id: "get_rust_api",
  description: "Get Rust API documentation for Tauri crates from docs.rs",
  inputSchema: z.object({
    crate: z
      .string()
      .describe("Crate name: 'tauri', 'tauri-plugin-dialog', etc."),
    item: z
      .string()
      .optional()
      .describe("Specific item: 'AppHandle', 'Builder', etc."),
  }),
  execute: async ({ context }) => {
    const url = context.item
      ? `https://docs.rs/${context.crate}/latest/${context.crate.replace(
          /-/g,
          "_"
        )}/${context.item}`
      : `https://docs.rs/${context.crate}/latest/${context.crate.replace(
          /-/g,
          "_"
        )}/`;
    const response = await fetch(url);
    const html = await response.text();
    return {
      crate: context.crate,
      item: context.item,
      content: parseDocsRs(html),
    };
  },
});
```

**Tradeoffs:**

- ✅ Single MCP for all Tauri development
- ❌ Breaks 4-tool philosophy
- ❌ Duplicates laptou's more comprehensive work
- ❌ Limited to Tauri crates (vs all crates with laptou's)

### Final Recommendation

**Build both MCPs and deploy on Mastra Cloud for HTTP access:**

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

See [rust-docs-mcp plan](../rust-docs-mcp/index.md) for the Rust documentation MCP.

---

## Mastra Cloud Deployment

### Why Mastra Cloud?

1. **No Local Installation:** Users connect via HTTP URL
2. **Auto-Scaling:** Handles traffic automatically
3. **IDE Snippets:** Auto-generates configuration for Cursor, VS Code, Windsurf
4. **Observability:** Built-in logging and tracing
5. **MCP Endpoints:** Automatic HTTP and SSE endpoints

### Deployment Process

1. Push code to GitHub
2. Connect repo to Mastra Cloud
3. Mastra auto-detects `src/mastra/index.ts`
4. Deploys and provides endpoints

### Generated Endpoints

| Endpoint                                         | Purpose            |
| ------------------------------------------------ | ------------------ |
| `https://tauri-docs-mcp.mastra.cloud/mcp`        | Streamable HTTP    |
| `https://tauri-docs-mcp.mastra.cloud/sse`        | Server-Sent Events |
| `https://tauri-docs-mcp.mastra.cloud/swagger-ui` | API docs           |

---

## Full Mastra App Structure

### Directory Layout

```
src/
└── mastra/
    ├── tools/
    │   ├── list-sections.ts
    │   ├── get-page.ts
    │   ├── search.ts
    │   └── get-plugin.ts
    ├── lib/
    │   ├── parsers.ts
    │   ├── cache.ts
    │   └── llms-txt.ts
    └── index.ts
```

### Entry Point (src/mastra/index.ts)

```typescript
import { Mastra } from "@mastra/core/mastra";
import { MCPServer } from "@mastra/mcp";
import { listSectionsTool } from "./tools/list-sections";
import { getPageTool } from "./tools/get-page";
import { searchTool } from "./tools/search";
import { getPluginTool } from "./tools/get-plugin";

const mcpServer = new MCPServer({
  name: "tauri-docs-mcp",
  version: "1.0.0",
  description: "Cloud-hosted MCP for Tauri documentation",
  tools: {
    list_sections: listSectionsTool,
    get_page: getPageTool,
    search: searchTool,
    get_plugin: getPluginTool,
  },
});

export const mastra = new Mastra({
  mcpServers: { "tauri-docs": mcpServer },
});
```

---

## HTML Parsing Strategy

### Option 1: Cheerio (lightweight)

```typescript
import * as cheerio from "cheerio";

function extractContent(html: string) {
  const $ = cheerio.load(html);
  $("script, style, nav, footer").remove();
  return $("main").text();
}
```

### Option 2: Turndown (HTML to Markdown)

```typescript
import TurndownService from "turndown";

const turndown = new TurndownService();
const markdown = turndown.turndown(html);
```

### Option 3: Simple Regex (for structured docs)

Since Tauri uses Starlight, content follows predictable patterns.

---

## Performance Considerations

### Caching Strategy

1. **Index Cache:** Cache llms.txt for 1 hour
2. **Page Cache:** Cache individual pages for 30 minutes
3. **Implementation:** In-memory Map with TTL

```typescript
const cache = new Map<string, { data: any; expires: number }>();

async function getCached<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }
  const data = await fetcher();
  cache.set(key, { data, expires: Date.now() + ttl });
  return data;
}
```

### Response Size

- Average page: 5-15KB markdown
- Plugin pages: 10-25KB (more examples)
- llms.txt: ~8KB

---

## Plugin List (from docs)

Official Tauri plugins available:

- Autostart
- Barcode Scanner
- Biometric
- CLI
- Clipboard
- Deep Linking
- Dialog
- File System
- Geolocation
- Global Shortcut
- Haptics
- HTTP Client
- Localhost
- Notification
- Opener
- OS
- Persisted Scope
- Positioner
- Process
- Shell
- Single Instance
- SQL
- Store
- Stronghold
- Updater
- Upload
- WebSocket
- Window State

---

## Testing Plan

1. **Unit Tests:** Test each tool in isolation
2. **Integration Tests:** Test with real Tauri docs
3. **MCP Protocol Tests:** Verify JSON-RPC compliance
4. **Performance Tests:** Measure response times

---

## References

- [Mastra MCP Docs](https://mastra.ai/docs/mcp/overview)
- [Tauri llms.txt](https://tauri.app/llms.txt)
- [MCP Specification](https://modelcontextprotocol.io/docs)
- [Starlight (Astro docs framework)](https://starlight.astro.build/)
