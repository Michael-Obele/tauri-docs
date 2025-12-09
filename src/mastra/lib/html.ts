import TurndownService from "turndown";
import * as cheerio from "cheerio";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export type PageContent = {
  title: string;
  markdown: string;
  html: string;
  url: string;
};

function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove script and style tags
  $("script, style, noscript, iframe, embed, object").remove();

  // Remove navigation elements
  $("nav, header, footer, aside").remove();

  // Remove theme switcher and other UI elements
  $(
    ".theme-selector-light, .theme-selector-dark, .theme-selector-auto"
  ).remove();
  $(
    "starlight-lang-select, starlight-select, starlight-menu-button, site-search"
  ).remove();
  $(".social-icons, .right-group").remove();

  // Remove specific Tauri docs elements
  $("#starlight__sidebar").remove();
  $(".sidebar-pane, .sidebar-content").remove();

  // Remove edit links and pagination
  $(".meta, .pagination-links").remove();
  $('a[href*="edit"]').remove();

  // Remove sponsors section and copyright
  $(".sponsors").remove();
  $('p:contains("©")').remove();

  // Get the main content - try different selectors
  let content = $("main, article, .article, .content, .post, .entry");
  if (content.length === 0) {
    // Fallback to body if no main content found
    content = $("body");
  }

  // If we still have wrapper elements, try to get the inner content
  if (content.length > 0) {
    const mainContent = content.first();
    // Remove any remaining navigation or sidebar elements within main
    mainContent.find("nav, aside, .sidebar, header, footer").remove();
    return mainContent.html() || "";
  }

  return "";
}

export async function fetchPageHtml(url: string): Promise<PageContent> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $("title").text().trim() || url;
  const cleanedHtml = cleanHtml(html);
  const markdown = turndown.turndown(cleanedHtml);

  return { title, markdown, html: cleanedHtml, url };
}

// Deprecated alias for backward compatibility
export const fetchPageMarkdown = fetchPageHtml;
