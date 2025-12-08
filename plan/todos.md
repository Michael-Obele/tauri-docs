# Tauri Docs MCP - TODOs

[← Back to Index](./index.md)

---

## Phase 1: Project Setup

- [x] Create new project directory
- [x] Initialize with `bun init`
- [x] Install dependencies:
  - [x] `@mastra/core`
  - [x] `@mastra/mcp`
  - [x] `zod`
  - [x] `cheerio`
  - [x] `turndown`
- [x] Configure TypeScript
- [x] Create Mastra directory structure:
  - [x] `src/mastra/tools/`
  - [x] `src/mastra/lib/`
  - [x] `src/mastra/index.ts`
- [x] Remove demo weather files (agent, workflow, tool, scorer)

## Phase 2: Library Implementation

### llms.txt Parser (src/mastra/lib/llms-txt.ts)

- [x] Create `fetchIndex()` function to get llms.txt
- [x] Create `parseIndex()` to parse llms.txt into structured data
- [x] Implement caching with TTL for index

### HTML Parsers (src/mastra/lib/parsers.ts)

- [x] Create `extractContent(html)` to get main content
- [x] Create `extractTitle(html)` helper
- [x] Create `parsePluginDoc(html)` for plugin pages (reused generic Turndown conversion)

### Caching (src/mastra/lib/cache.ts)

- [x] Implement in-memory cache with TTL
- [x] Create `getCached(key, ttl, fetcher)` helper

## Phase 3: Tool Implementation

### src/mastra/tools/list-sections.ts

- [x] Create `listSectionsTool` with createTool
- [x] Implement output schema (sections array)
- [x] Connect to llms-txt parser

### src/mastra/tools/get-page.ts

- [x] Create `getPageTool` with createTool
- [x] Implement input schema (path)
- [x] Implement output schema (title, content, url)
- [x] Connect to HTML parser

### src/mastra/tools/search.ts

- [x] Create `searchTool` with createTool
- [x] Implement input schema (query)
- [x] Implement output schema (results array)
- [x] Implement keyword-based search over index
- [x] Add relevance scoring

### src/mastra/tools/get-plugin.ts

- [x] Create `getPluginTool` with createTool
- [x] Implement input schema (name)
- [x] Implement output schema (plugin documentation)
- [x] Connect to plugin parser

## Phase 4: Mastra App Setup

### src/mastra/index.ts

- [x] Import all tools
- [x] Create MCPServer instance with all 4 tools
- [x] Create Mastra instance with MCPServer
- [x] Export mastra instance

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
