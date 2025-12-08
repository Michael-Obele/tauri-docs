# Tauri Docs MCP - TODOs

[← Back to Index](./index.md)

---

## Phase 1: Project Setup

- [ ] Create new project directory
- [ ] Initialize with `bun init`
- [ ] Install dependencies:
  - [ ] `@mastra/core`
  - [ ] `@mastra/mcp`
  - [ ] `zod`
  - [ ] `cheerio`
- [ ] Configure TypeScript
- [ ] Create Mastra directory structure:
  - [ ] `src/mastra/tools/`
  - [ ] `src/mastra/lib/`
  - [ ] `src/mastra/index.ts`

## Phase 2: Library Implementation

### llms.txt Parser (src/mastra/lib/llms-txt.ts)

- [ ] Create `fetchIndex()` function to get llms.txt
- [ ] Create `parseIndex()` to parse llms.txt into structured data
- [ ] Implement caching with TTL for index

### HTML Parsers (src/mastra/lib/parsers.ts)

- [ ] Create `extractContent(html)` to get main content
- [ ] Create `extractTitle(html)` helper
- [ ] Create `parsePluginDoc(html)` for plugin pages

### Caching (src/mastra/lib/cache.ts)

- [ ] Implement in-memory cache with TTL
- [ ] Create `getCached(key, ttl, fetcher)` helper

## Phase 3: Tool Implementation

### src/mastra/tools/list-sections.ts

- [ ] Create `listSectionsTool` with createTool
- [ ] Implement output schema (sections array)
- [ ] Connect to llms-txt parser

### src/mastra/tools/get-page.ts

- [ ] Create `getPageTool` with createTool
- [ ] Implement input schema (path)
- [ ] Implement output schema (title, content, url)
- [ ] Connect to HTML parser

### src/mastra/tools/search.ts

- [ ] Create `searchTool` with createTool
- [ ] Implement input schema (query)
- [ ] Implement output schema (results array)
- [ ] Implement keyword-based search over index
- [ ] Add relevance scoring

### src/mastra/tools/get-plugin.ts

- [ ] Create `getPluginTool` with createTool
- [ ] Implement input schema (name)
- [ ] Implement output schema (plugin documentation)
- [ ] Connect to plugin parser

## Phase 4: Mastra App Setup

### src/mastra/index.ts

- [ ] Import all tools
- [ ] Create MCPServer instance with all 4 tools
- [ ] Create Mastra instance with MCPServer
- [ ] Export mastra instance

## Phase 5: Local Testing

- [ ] Run `bun run dev` (mastra dev)
- [ ] Test in Mastra Studio UI
- [ ] Test each tool:
  - [ ] `list_sections` - Get documentation structure
  - [ ] `get_page` - Fetch "start/create-project"
  - [ ] `search` - Search for "window"
  - [ ] `get_plugin` - Get dialog plugin docs
- [ ] Verify caching works

## Phase 6: Mastra Cloud Deployment

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Sign up for Mastra Cloud
- [ ] Connect GitHub repository
- [ ] Configure project:
  - [ ] Set project name
  - [ ] Verify Mastra directory detection
- [ ] Deploy to Mastra Cloud
- [ ] Note HTTP/SSE endpoint URLs

## Phase 7: Verification

- [ ] Test HTTP endpoint with MCP client
- [ ] Test SSE endpoint with MCP client
- [ ] Verify IDE configuration snippets:
  - [ ] Cursor
  - [ ] VS Code
  - [ ] Windsurf
- [ ] Test with Claude Desktop (HTTP mode)

## Phase 8: Documentation

- [ ] Create comprehensive README.md
  - [ ] Project description
  - [ ] Quick start with HTTP endpoint
  - [ ] All 4 tools documented
  - [ ] Example queries
- [ ] Add usage examples:
  - [ ] Claude Desktop configuration
  - [ ] Cursor configuration
  - [ ] VS Code configuration
- [ ] Document companion MCP (rust-docs-mcp)
- [ ] Include combined configuration example

---

## Future Enhancements (Post-MVP)

- [ ] ~~Add `get_api_reference` tool for Rust docs.rs integration~~ (Use rust-docs-mcp instead)
- [ ] Add version switching (v1 vs v2 docs)
- [ ] Support for i18n docs (Japanese, French, Spanish, etc.)
- [ ] GitHub integration to fetch code examples from tauri-apps repos
- [ ] Add semantic search with embeddings
- [ ] Create web-based documentation explorer

---

## Blockers / Questions

- [ ] Confirm Mastra Cloud project URL format
- [ ] Decide on caching strategy for cloud deployment

---

## Dependencies

```json
{
  "dependencies": {
    "@mastra/core": "latest",
    "@mastra/mcp": "latest",
    "zod": "^3.23.0",
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0"
  }
}
```

## Blockers / Questions

- [ ] Confirm npm package name availability: `tauri-docs-mcp`
- [ ] Decide on caching strategy for serverless (in-memory vs external)
- [ ] Consider if we should include Tauri v1 docs or v2 only

---

## Dependencies List

```json
{
  "dependencies": {
    "@mastra/mcp": "latest",
    "@mastra/core": "latest",
    "zod": "^3.23.0",
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^22.0.0"
  }
}
```
