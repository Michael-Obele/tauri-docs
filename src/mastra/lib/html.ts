import TurndownService from "turndown";
import * as cheerio from "cheerio";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export type PageContent = {
  title: string;
  markdown: string;
  url: string;
};

export async function fetchPageMarkdown(url: string): Promise<PageContent> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $("title").text().trim() || url;
  const markdown = turndown.turndown(html);

  return { title, markdown, url };
}
