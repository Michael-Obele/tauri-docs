# tauri-docs

Mastra MCP server providing access to Tauri documentation from tauri.app.

## 📦 Versioning & Releases

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and changelog generation based on conventional commits.

### Commit Message Format

Use conventional commit format for automatic versioning:

- `feat:` - Minor version bump (new features)
- `fix:` - Patch version bump (bug fixes)
- `BREAKING CHANGE:` - Major version bump (breaking changes)
- `docs:`, `chore:`, `refactor:`, `test:`, `ci:` - No version bump

### Release Triggers

Releases are automatically triggered on pushes to `main` branch when commit messages contain version keywords:

- `[patch]` - Forces patch release
- `[minor]` - Forces minor release
- `[major]` - Forces major release

Alternatively, trigger manually via GitHub Actions → "Release Changelog" → "Run workflow".

### What Happens on Release

1. Analyzes commits since last release
2. Determines version bump based on conventional commits
3. Generates/updates `CHANGELOG.md`
4. Creates git tag (e.g., `v1.0.0`)
5. Commits changes back to repository

### Viewing Changes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and history.

## Production Deployments

Choose the base host that fits your workflow — both expose the same toolset, but their runtime characteristics differ:

| Deployment   | URL                             | Description                                                                                      |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Mastra Cloud | https://tauri-docs.mastra.cloud | Primary choice - Zero cold start, maximum responsiveness, and consistently reliable performance. |

- Append `/api/mcp/tauri-docs/sse` for the SSE transport (best for editors that keep long-lived connections).
- Append `/api/mcp/tauri-docs/mcp` for the HTTP transport (handy for CLIs and quick one-off calls).
- Mastra Cloud is the recommended primary deployment - it offers zero cold start and maximum responsiveness.

Endpoint reference & alternates

- Mastra Cloud SSE: [https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse](https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/sse)
- Mastra Cloud HTTP: [https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp](https://tauri-docs.mastra.cloud/api/mcp/tauri-docs/mcp)

This repository contains a Mastra-based MCP server that provides access to Tauri documentation from tauri.app. Use it in your AI-powered code editor to get instant access to the latest Tauri documentation directly from the official Tauri documentation site.

## 🎉 What's New

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

<details>
<summary>Editor Setup</summary>

Mastra Cloud is the recommended deployment for reliability and responsiveness.

### Windsurf

1. Edit `~/.codeium/windsurf/mcp_config.json`.
2. Mastra Cloud is recommended for zero cold start and maximum responsiveness. Add the SSE transport as shown:

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

Use the HTTP variant if you need it:

```json
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

3. Save, restart Zed, and confirm the server shows a green indicator in the Agent panel. Zed also offers a UI flow via Settings → Agent to paste either endpoint without editing JSON.

### Cursor

1. Open Cursor Settings (`Cmd/Ctrl` + `,`).
2. Navigate to "MCP" / "Model Context Protocol" and add a new server configuration.
3. Mastra Cloud is recommended for zero cold start and maximum responsiveness. Append the SSE or HTTP path as shown in the examples below.

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

</details>

<details><summary>CLI & Agent Configuration</summary>

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

- Use `/permissions` inside Claude Code to grant tool access if prompted.

### OpenAI Codex CLI

Register the Mastra Cloud endpoint for codex or use your own privately hosted MCP endpoint.

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

2. Add a configuration. Mastra Cloud example:

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

4. Mastra Cloud is recommended for zero cold start and maximum responsiveness. Restart the CLI to apply changes.

</details>

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

### Contents

- `src/` - Mastra bootstrap, MCP servers, tools, and agents
- `src/mastra/tools/` - Tools for accessing Tauri documentation
- `src/mastra/lib/` - Caching, parsing, metrics, and utility functions
  - `types.ts` - TypeScript types and Zod schemas
  - `cache-manager.ts` - LRU cache with automatic eviction
  - `metrics.ts` - Request tracking and health monitoring
  - `llms-txt.ts` - Documentation index parsing
  - `html.ts` - HTML fetching and cleaning
- `scripts/` - Version management and automation scripts (if any)
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

### Contents

- `src/` - Mastra bootstrap, MCP servers, tools, and agents
- `src/mastra/tools/` - Tools for accessing Tauri documentation
- `src/mastra/lib/` - Caching, parsing, and utility functions
- `scripts/` - Version management and automation scripts (if any)

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

## Useful scripts

- `npm run dev` – Start Mastra in development mode (recommended smoke-test).
- `npm run build` – Build the Mastra project for production.
- `npm run start` – Start the built Mastra server.
- `npm run check-versions` – Check if package.json and mcp-server.ts versions match (fails if mismatched). (If applicable)
- `npm run sync-versions-auto` – Check versions and auto-sync if mismatched (package.json is source of truth). (If applicable)
- `npm run sync-versions` – Sync versions from latest git tag to both files. (If applicable)

## MCP Architecture

This project exposes a production-ready MCP Server that makes Tauri documentation available to AI code editors.

What this means:

- MCP Server (`src/mastra/index.ts`) - Exposes four Tauri documentation tools to external MCP clients (Cursor, Windsurf, VS Code, etc.)
- No MCP Client needed - This project only provides tools, it doesn't consume tools from other servers

The server is deployed at `https://tauri-docs.mastra.cloud` and exposes tools via HTTP and SSE transports.

## Project Architecture

### Key Features

- **Real-time Documentation**: Always fetches latest content from tauri.app
- **Comprehensive Coverage**: Access to guides, APIs, plugins, and references
- **Advanced Caching**: LRU cache with automatic eviction and size limits (10MB index, 50MB pages)
- **Metrics & Monitoring**: Request tracking, cache statistics, and health checks
- **Type Safety**: Full TypeScript support with Zod validation
- **Resources API**: Static documentation metadata (structure, platforms, plugins, metrics)
- **Guided Prompts**: Step-by-step workflows for common tasks
- **Search Functionality**: Find documentation by keywords with relevance scoring
- **Clean HTML Output**: Returns parsed documentation with navigation/scripts removed

## Conventions & notes

- Tools use `zod` for input validation and follow Mastra patterns with `createTool`
- Web scraping uses cheerio and turndown for HTML to markdown conversion
- Intelligent caching reduces API calls while ensuring freshness

## Development tips

- Node >= 22.13.0 required (see `package.json` engines)
- Run `npm run dev` for smoke tests after changes
- Clear cache during development if fresh data needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## Contact

- Issues & Support: [GitHub Issues](https://github.com/Michael-Obele/tauri-docs/issues)
- Maintainer: Michael Obele

For more details:

- Web scraping services: See `src/mastra/lib/` for documentation fetching and parsing implementation
