import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchLlmsTxt, type DocsIndex } from "../lib/llms-txt";
import { indexCache } from "../lib/cache-manager";
import type { SearchResult } from "../lib/types";
import { search as fuzzySearch } from "fast-fuzzy";

// TF-IDF implementation
class TFIDFSearch {
  private documents: Array<{
    id: number;
    title: string;
    path: string;
    content: string;
  }> = [];
  private termFrequency: Map<string, Map<number, number>> = new Map();
  private documentFrequency: Map<string, number> = new Map();
  private totalDocuments = 0;

  addDocument(id: number, title: string, path: string, content: string = "") {
    this.documents.push({ id, title, path, content });
    this.totalDocuments++;

    // Tokenize and index
    const text = `${title} ${path} ${content}`.toLowerCase();
    const terms = this.tokenize(text);

    const docTermFreq = new Map<string, number>();
    terms.forEach((term) => {
      docTermFreq.set(term, (docTermFreq.get(term) || 0) + 1);
    });

    // Update term frequency and document frequency
    docTermFreq.forEach((freq, term) => {
      if (!this.termFrequency.has(term)) {
        this.termFrequency.set(term, new Map());
      }
      this.termFrequency.get(term)!.set(id, freq);

      this.documentFrequency.set(
        term,
        (this.documentFrequency.get(term) || 0) + 1
      );
    });
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 1);
  }

  private calculateTFIDF(term: string, docId: number): number {
    const tf = this.termFrequency.get(term)?.get(docId) || 0;
    const df = this.documentFrequency.get(term) || 0;

    if (tf === 0 || df === 0) return 0;

    const idf = Math.log(this.totalDocuments / df);
    return tf * idf;
  }

  search(
    query: string,
    options: { fuzzy?: boolean; limit?: number } = {}
  ): Array<{ docId: number; score: number; title: string; path: string }> {
    const { fuzzy = true, limit = 20 } = options;
    const queryTerms = this.tokenize(query);

    if (queryTerms.length === 0) return [];

    const results = new Map<
      number,
      { score: number; title: string; path: string }
    >();

    // Search through all documents
    this.documents.forEach((doc) => {
      let totalScore = 0;
      let matchedTerms = 0;

      // Calculate TF-IDF score for exact matches
      queryTerms.forEach((queryTerm) => {
        // Title matches get 3x weight
        const titleScore = this.calculateTFIDF(queryTerm, doc.id) * 3;
        if (titleScore > 0) {
          totalScore += titleScore;
          matchedTerms++;
        }

        // Path matches get 2x weight
        const pathScore = this.calculateTFIDF(queryTerm, doc.id) * 2;
        if (pathScore > 0) {
          totalScore += pathScore;
          matchedTerms++;
        }

        // Content matches get 1x weight
        const contentScore = this.calculateTFIDF(queryTerm, doc.id);
        if (contentScore > 0) {
          totalScore += contentScore;
          matchedTerms++;
        }
      });

      // Fuzzy matching for partial matches
      if (fuzzy && matchedTerms === 0) {
        const titleMatch = fuzzySearch(query, [doc.title], {
          returnMatchData: true,
        })[0];
        const pathMatch = fuzzySearch(query, [doc.path], {
          returnMatchData: true,
        })[0];

        if (titleMatch && titleMatch.score > 0.6) {
          totalScore = titleMatch.score * 3;
          matchedTerms++;
        }

        if (pathMatch && pathMatch.score > 0.6) {
          totalScore += pathMatch.score * 2;
          matchedTerms++;
        }
      }

      if (totalScore > 0) {
        results.set(doc.id, {
          score: totalScore,
          title: doc.title,
          path: doc.path,
        });
      }
    });

    // Sort by score and return top results
    return Array.from(results.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([docId, data]) => ({
        docId,
        score: data.score,
        title: data.title,
        path: data.path,
      }));
  }
}

// Global TF-IDF index
let tfidfIndex: TFIDFSearch | null = null;

export const searchTool = createTool({
  id: "search",
  description:
    "Search Tauri documentation index by keywords with improved relevance scoring, fuzzy matching, and category filtering",
  inputSchema: z.object({
    query: z.string().min(2).describe("Keywords to search for"),
    category: z
      .string()
      .optional()
      .describe(
        "Filter by documentation category (e.g., 'api', 'guide', 'plugin')"
      ),
    limit: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .default(20)
      .describe("Maximum number of results to return"),
    fuzzy: z
      .boolean()
      .optional()
      .default(true)
      .describe("Enable fuzzy matching for typos"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        path: z.string(),
        relevance: z.number(),
        url: z.string(),
        category: z.string().optional(),
      })
    ),
    totalResults: z.number(),
    suggestions: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    // Try to get cached index
    let index = indexCache.get<DocsIndex>("docs-index-raw");
    if (!index) {
      index = await fetchLlmsTxt();
      indexCache.set("docs-index-raw", index);
    }

    // Initialize TF-IDF index if not done
    if (!tfidfIndex) {
      tfidfIndex = new TFIDFSearch();
      index.sections.forEach((section, i) => {
        tfidfIndex!.addDocument(i, section.title, section.path);
      });
    }

    const { query, category, limit = 20, fuzzy = true } = context;

    // Perform search
    let searchResults = tfidfIndex.search(query, { fuzzy, limit });

    // Filter by category if specified
    if (category) {
      const categoryLower = category.toLowerCase();
      searchResults = searchResults.filter((result) => {
        const pathLower = result.path.toLowerCase();
        return (
          pathLower.includes(`/${categoryLower}/`) ||
          pathLower.includes(`${categoryLower}-`) ||
          result.title.toLowerCase().includes(categoryLower)
        );
      });
    }

    // Generate suggestions for short queries
    let suggestions: string[] | undefined;
    if (query.length < 5 && searchResults.length === 0) {
      const allTitles = index.sections.map((s) => s.title);
      const fuzzyResults = fuzzySearch(query, allTitles);
      suggestions = fuzzyResults.slice(0, 5);
    }

    const results = searchResults.map((result) => {
      // Determine category from path
      let resultCategory: string | undefined;
      const pathParts = result.path.split("/");
      if (pathParts.length > 1) {
        const categoryPart = pathParts[1];
        if (
          ["api", "guide", "plugin", "develop", "reference"].includes(
            categoryPart
          )
        ) {
          resultCategory = categoryPart;
        }
      }

      return {
        title: result.title,
        path: result.path,
        relevance: Math.round(result.score * 100) / 100,
        url: `https://v2.tauri.app/${result.path}`,
        category: resultCategory,
      };
    });

    return {
      results,
      totalResults: results.length,
      suggestions,
    };
  },
});
