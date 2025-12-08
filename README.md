# tauri-docs-mcp

Cloud-hosted (pending deploy) Mastra MCP server that exposes Tauri documentation tools over MCP. It complements the already-deployed Rust docs MCP for full-stack Tauri development.

## Status
- MCP server code is complete; Mastra Cloud deployment is **not yet live**.
- Rust MCP (rust-docs) is already deployed; use it alongside this server for Rust API coverage.

## Tools
- `list_sections` – parse `https://tauri.app/llms.txt` to list doc sections.
- `get_page` – fetch a Tauri doc page and return cleaned Markdown (HTML → Markdown via Turndown + Cheerio).
- `search` – keyword search across the llms.txt index.
- `get_plugin` – fetch plugin doc pages by name.

## Quick start (local)
```bash
bun install
bun run dev   # mastra dev
```

The Mastra entrypoint is `src/mastra/index.ts`. Agents are not exposed in production; a commented stub lives in `src/mastra/agents/` if needed.

## MCP configuration (HTTP, once deployed)
```json
{
	"mcpServers": {
		"tauri-docs": {
			"url": "https://tauri-docs-mcp.mastra.cloud/mcp" // pending deploy
		},
		"rust-docs": {
			"url": "https://rust-docs-mcp.mastra.cloud/mcp" // already deployed
		}
	}
}
```

## Project notes
- HTML → Markdown uses Turndown with Cheerio to strip layout chrome.
- In-memory TTL cache for llms.txt and fetched pages (30–60 minute defaults).
- Built with `@mastra/core` + `@mastra/mcp`.

## Scripts
- `bun run dev` – Mastra dev server
- `bun run build` – Mastra build
- `bun run start` – Start built app
