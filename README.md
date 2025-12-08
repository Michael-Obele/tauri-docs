# tauri-docs

Mastra MCP server providing access to Tauri documentation from tauri.app.

## Production Deployments

Choose the base host that fits your workflow — both expose the same toolset, but their runtime characteristics differ:

|              |                                 |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Mastra Cloud | https://tauri-docs.mastra.cloud | Primary choice - Zero cold start, maximum responsiveness, and consistently reliable performance. (Pending deployment) |

• Append `/api/mcp/tauri-docs/sse` for the SSE transport (best for editors that keep long-lived connections).
• Append `/api/mcp/tauri-docs/mcp` for the HTTP transport (handy for CLIs and quick one-off calls).
• Mastra Cloud is the recommended primary deployment - it offers zero cold start and maximum responsiveness. (Pending deployment)

Endpoint reference & alternates

• Mastra Cloud SSE: [https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse](https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse) (Pending deployment)
• Mastra Cloud HTTP: [https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp](https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp) (Pending deployment)

This repository contains a Mastra-based MCP server that provides access to Tauri documentation from tauri.app. Use it in your AI-powered code editor to get instant access to the latest Tauri documentation directly from the official Tauri documentation site.

## 🎉 What's New

• ✅ MCP server code complete; Mastra Cloud deployment pending
• ✅ Four main MCP tools for documentation discovery, page retrieval, and search
• ✅ Intelligent caching for improved performance
• ✅ Support for all major AI code editors (Cursor, Windsurf, VS Code, Zed, Claude Code, Codex)
• ✅ HTTP and SSE transport protocols (once deployed)
• ✅ Real-time web scraping from tauri.app

## Editor Setup

Mastra Cloud is the recommended deployment for reliability and responsiveness. (Pending deployment)

### Windsurf

1. Edit `~/.codeium/windsurf/mcp_config.json`.
2. Mastra Cloud is recommended for zero cold start and maximum responsiveness. Add the SSE transport as shown:

```
{
  "mcpServers": {
    "tauri-docs": {
      "url": "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse",
      "transport": "sse"
    }
  }
}
```

3. Save, restart Windsurf, then open `mcp.json` in Agent mode and click "start".

Use the HTTP variant if you need it:

```
{
  "servers": {
    "tauri-docs": {
      "type": "http",
      "url": "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp"
    }
  }
}
```

### Zed

1. Open Zed settings (`Cmd/Ctrl` + `,`).
2. Edit `~/.config/zed/settings.json` and add an entry under `context_servers`:

```
{
  "context_servers": {
    "tauri-docs": {
      "source": "custom",
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse"
      ],
      "env": {}
    }
  }
}
```

3. Save, restart Zed, and confirm the server shows a green indicator in the Agent panel. Zed also offers a UI flow via Settings → Agent to paste either endpoint without editing JSON.

### Cursor

1. Open Cursor Settings (`Cmd/Ctrl` + `,`).
2. Navigate to "MCP" / "Model Context Protocol" and add a new server configuration.
3. Mastra Cloud is recommended for zero cold start and maximum responsiveness. Append the SSE or HTTP path as shown in the examples below.

Mastra Cloud — SSE example:

```
{
  "tauri-docs": {
    "type": "sse",
    "url": "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse"
  }
}
```

Mastra Cloud — HTTP example:

```
{
  "tauri-docs": {
    "type": "http",
    "url": "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp"
  }
}
```

### VS Code

VS Code users can open the Command Palette (`Cmd/Ctrl+Shift+P`) and run `MCP: Add server` to paste either URL.

## CLI & Agent Configuration

The same base URLs work across CLIs. Mastra Cloud is the recommended primary deployment for the fastest responses with zero cold start. (Pending deployment)

### Claude Code CLI (Anthropic)

• Global settings (`~/.claude/settings.json`):

```
{
    "mcpServers": {
      "tauri-docs": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-remote",
          "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp"
        ]
      }
    }
}
```

• Project-scoped override (`.mcp.json`):

```
{
    "mcpServers": {
      "tauri-docs": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-remote",
          "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp"
        ]
      }
    }
}
```

Enable project servers with:

```
{
    "enableAllProjectMcpServers": true
}
```

• Command palette alternative:

```
claude mcp add tauri-docs --url https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp
```

• Use `/permissions` inside Claude Code to grant tool access if prompted.

### OpenAI Codex CLI

Register the Mastra Cloud endpoint for codex or use your own privately hosted MCP endpoint.

```
codex mcp add tauri-docs --url https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse
codex mcp list
```

### Gemini CLI (Google)

1. Create or edit `~/.gemini/settings.json`:

```
mkdir -p ~/.gemini
nano ~/.gemini/settings.json
```

2. Add a configuration. Mastra Cloud example:

```
{
     "mcpServers": {
       "tauri-docs": {
         "httpUrl": "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp"
       }
     }
}
```

3. Prefer the `npx mcp-remote` command variant if your CLI version expects a command:

```
{
     "mcpServers": {
       "tauri-docs": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp"
         ]
       }
     }
}
```

4. Mastra Cloud is recommended for zero cold start and maximum responsiveness. Restart the CLI to apply changes.

## Verification & Quick Tests

• `claude mcp list`
• `codex mcp list`
• `npx mcp-remote https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp` (Pending deployment)
• `curl -I https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp` (Pending deployment)
• `curl -N https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse` (Pending deployment)

Claude Code may prompt for tool permissions — use `/permissions` or set `allowedTools` in `~/.claude.json`. Editors that maintain long-lived connections should use the SSE URL; quick scripts can stick with HTTP.

## Available Tools

Once installed, your AI assistant will have access to these tools (IDs exactly as exposed by the MCP server):

1. `list_sections` — Parse `https://tauri.app/llms.txt` to list doc sections
2. `get_page` — Fetch a Tauri doc page and return cleaned Markdown (HTML → Markdown via Turndown + Cheerio)
3. `search` — Keyword search across the llms.txt index
4. `get_plugin` — Fetch plugin doc pages by name

### Tool response formats (quick reference)

• `list_sections`: List of documentation sections from llms.txt
• `get_page`: Markdown documentation for a specific page
• `search`: List of matching sections or pages based on keywords
• `get_plugin`: Markdown documentation for a specific plugin

## Example Usage

After installing the MCP server in your editor, you can ask your AI assistant:

• "Show me the Tauri plugin documentation"
• "Get the overview of Tauri APIs"
• "List all sections in Tauri docs"
• "Search for Tauri configuration options"
• "What are the methods available in Tauri?"
• "Find plugins related to web frameworks"
• "Get documentation for the Tauri window API"
• "Search for docs with 'security' in the name"
• "Show me the Tauri CLI documentation"

## Local Development

Want to run the MCP server locally or contribute to the project?

### Contents

• `src/` - Mastra bootstrap, MCP servers, tools, and agents
• `src/mastra/tools/` - Tools for accessing Tauri documentation
• `src/mastra/lib/` - Caching, parsing, and utility functions
• `scripts/` - Version management and automation scripts (if any)

### Quick start (development smoke-test)

1. Install dependencies (using your preferred package manager).

```
# npm
npm install

# or bun
bun install

# or pnpm
pnpm install
```

2. Run the development smoke-test (recommended):

```
# Starts Mastra in dev mode; this repo's smoke-test expects a short run to detect runtime errors
npm run dev
```

## Useful scripts

• `npm run dev` – Start Mastra in development mode (recommended smoke-test).
• `npm run build` – Build the Mastra project for production.
• `npm run start` – Start the built Mastra server.
• `npm run check-versions` – Check if package.json and mcp-server.ts versions match (fails if mismatched). (If applicable)
• `npm run sync-versions-auto` – Check versions and auto-sync if mismatched (package.json is source of truth). (If applicable)
• `npm run sync-versions` – Sync versions from latest git tag to both files. (If applicable)

## MCP Architecture

This project exposes a production-ready MCP Server that makes Tauri documentation available to AI code editors.

What this means:

• MCP Server (`src/mastra/index.ts`) - Exposes four Tauri documentation tools to external MCP clients (Cursor, Windsurf, VS Code, etc.)
• No MCP Client needed - This project only provides tools, it doesn't consume tools from other servers

The server will be deployed at `https://tauri-docs.mastra.cloud` and exposes tools via HTTP and SSE transports. (Pending deployment)

## Project Architecture

### Core Components

• Mastra Framework: Orchestrates agents, workflows, and MCP servers
• MCP Server: Exposes tools to AI code editors via HTTP/SSE protocols
• Web Scraping Services: Fetches documentation from tauri.app
• Intelligent Caching: Reduces API calls while ensuring freshness
• Documentation Parsing: Extracts structured information from HTML documentation

### Key Features

• Real-time Documentation: Always fetches latest content from tauri.app
• Comprehensive Coverage: Access to guides, APIs, plugins, and references
• Intelligent Caching: Reduces API calls while ensuring freshness
• Search Functionality: Find documentation by keywords
• Markdown Output: Returns parsed documentation as clean Markdown

## Conventions & notes

• Tools are implemented under `src/mastra/tools` and should use `zod` for input validation
• Web scraping uses cheerio and turndown for HTML to markdown conversion
• Intelligent caching is used to improve performance and reduce API calls
• Tools follow Mastra patterns using `createTool` with proper input/output schemas

## Development tips

• Node >= 22.13.0 is recommended (see `package.json` engines)
• When adding tools, follow the patterns in existing tools
• After making changes, run the 10–15s smoke-test via `npm run dev` to surface runtime integration issues early
• The system uses intelligent caching - clear cache if you need fresh data during development

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. (If applicable)

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started. (If applicable)

## Contact

• Issues & Support: [GitHub Issues](https://github.com/Michael-Obele/tauri-docs/issues)
• Maintainer: Michael Obele

For more details:

• Web scraping services: See `src/mastra/lib/` for documentation fetching and parsing implementation
