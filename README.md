# tauri-docs

Mastra MCP server providing access to Tauri documentation from tauri.app.

## Production Deployments

| Deployment   | URL                             | Description                                                                                      |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Mastra Cloud | https://tauri-docs.mastra.cloud | Primary choice - Zero cold start, maximum responsiveness, and consistently reliable performance. |

- Append `/api/mcp/tauri-docs/sse` for the SSE transport (best for editors that keep long-lived connections).
- Append `/api/mcp/tauri-docs/mcp` for the HTTP transport (handy for CLIs and quick one-off calls).
- Mastra Cloud is the recommended primary deployment - it offers zero cold start and maximum responsiveness.

This repository contains a Mastra-based MCP server that provides access to Tauri documentation from tauri.app. Use it in your AI-powered code editor to get instant access to the latest Tauri documentation directly from the official Tauri documentation site.

## 🎉 Features

- ✅ MCP server deployed on Mastra Cloud
- ✅ Four main MCP tools for documentation discovery, page retrieval, and search
- ✅ Advanced LRU caching with automatic eviction and size limits
- ✅ Request metrics and health monitoring
- ✅ TypeScript type safety with Zod schemas
- ✅ Resources API for static documentation metadata
- ✅ Guided prompts for common Tauri workflows
- ✅ Support for all major AI code editors (Cursor, Windsurf, VS Code, Zed, Claude Code, Codex)
- ✅ HTTP and SSE transport protocols
- ✅ Real-time web scraping from tauri.app

## Editor Setup

Mastra Cloud is the recommended deployment for reliability and responsiveness.

### Windsurf

1. Edit `~/.codeium/windsurf/mcp_config.json`.
2. Add the SSE transport:

```json
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

### Zed

1. Open Zed settings (`Cmd/Ctrl` + `,`).
2. Edit `~/.config/zed/settings.json` and add an entry under `context_servers`:

```json
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

3. Save, restart Zed, and confirm the server shows a green indicator in the Agent panel.

### Cursor

1. Open Cursor Settings (`Cmd/Ctrl` + `,`).
2. Navigate to "MCP" / "Model Context Protocol" and add a new server configuration.

Mastra Cloud — SSE example:

```json
{
  "tauri-docs": {
    "type": "sse",
    "url": "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse"
  }
}
```

Mastra Cloud — HTTP example:

```json
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

The same base URLs work across CLIs. Mastra Cloud is the recommended primary deployment for the fastest responses with zero cold start.

### Claude Code CLI (Anthropic)

- Global settings (`~/.claude/settings.json`):

```json
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

- Project-scoped override (`.mcp.json`):

```json
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

```json
{
  "enableAllProjectMcpServers": true
}
```

- Command palette alternative:

```bash
claude mcp add tauri-docs --url https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp
```

### OpenAI Codex CLI

Register the Mastra Cloud endpoint for codex:

```bash
codex mcp add tauri-docs --url https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse
codex mcp list
```

### Gemini CLI (Google)

1. Create or edit `~/.gemini/settings.json`:

```bash
mkdir -p ~/.gemini
nano ~/.gemini/settings.json
```

2. Add a configuration:

```json
{
  "mcpServers": {
    "tauri-docs": {
      "httpUrl": "https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp"
    }
  }
}
```

3. Prefer the `npx mcp-remote` command variant if your CLI version expects a command:

```json
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

## Verification & Quick Tests

- `claude mcp list`
- `codex mcp list`
- `npx mcp-remote https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp`
- `curl -I https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp`
- `curl -N https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse`

Claude Code may prompt for tool permissions — use `/permissions` or set `allowedTools` in `~/.claude.json`. Editors that maintain long-lived connections should use the SSE URL; quick scripts can stick with HTTP.

## Available Tools

Once installed, your AI assistant will have access to these tools (IDs exactly as exposed by the MCP server):

### Core Tools

1. `list_sections` — Parse `https://tauri.app/llms.txt` to list doc sections
2. `get_page` — Fetch a Tauri doc page and return cleaned HTML content
3. `search` — Keyword search across the llms.txt index
4. `get_plugin` — Fetch plugin doc pages by name

### Resources (NEW)

Static, auto-updating resources available via the MCP Resources API:

1. `tauri://docs/structure` — Complete documentation structure from llms.txt
2. `tauri://platforms` — Supported platforms (Windows, macOS, Linux, iOS, Android)
3. `tauri://metrics` — Real-time server metrics (requests, cache, health)

### Prompts (NEW)

Guided workflows for common tasks:

1. `getting-started` — Step-by-step guide to create your first Tauri app
2. `troubleshooting` — Common issues and debugging workflows
3. `plugin-setup` — Guide to installing and configuring plugins
4. `migration-v1-to-v2` — Guide for migrating from Tauri v1 to v2

### Tool response formats (quick reference)

- `list_sections`: List of documentation sections from llms.txt with total count
- `get_page`: Cleaned HTML documentation for a specific page
- `search`: List of matching sections with relevance scores and total count

### Example Usage

After installing the MCP server in your editor, you can ask your AI assistant:

- "Show me the Tauri plugin documentation"
- "Get the overview of Tauri APIs"
- "List all sections in Tauri docs"
- "Search for Tauri configuration options"
- "What are the methods available in Tauri?"
- "Find plugins related to web frameworks"
- "Get documentation for the Tauri window API"
- "Search for docs with 'security' in the name"
- "Show me the Tauri CLI documentation"

## Local Development

Want to run the MCP server locally or contribute to the project?

### Quick start (development smoke-test)

1. Install dependencies (using your preferred package manager).

```bash
# npm
npm install

# or bun
bun install

# or pnpm
pnpm install
```

2. Run the development smoke-test (recommended):

```bash
# Starts Mastra in dev mode; this repo's smoke-test expects a short run to detect runtime errors
npm run dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## Contact

- Issues & Support: [GitHub Issues](https://github.com/Michael-Obele/tauri-docs/issues)
- Maintainer: Michael Obele

For more details:

- Web scraping services: See `src/mastra/lib/` for documentation fetching and parsing implementation
