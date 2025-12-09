import { z } from "zod";

// =============================
// Tool Response Types
// =============================

export const SectionSchema = z.object({
  title: z.string(),
  path: z.string(),
});
export type Section = z.infer<typeof SectionSchema>;

export const SearchResultSchema = z.object({
  title: z.string(),
  path: z.string(),
  relevance: z.number().optional(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const PageContentSchema = z.object({
  title: z.string(),
  content: z.string(), // HTML content
  url: z.string(),
});
export type PageContent = z.infer<typeof PageContentSchema>;

export const PluginContentSchema = z.object({
  title: z.string(),
  content: z.string(), // HTML content
  url: z.string(),
});
export type PluginContent = z.infer<typeof PluginContentSchema>;

// =============================
// Cache Types
// =============================

export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  size: number; // in bytes
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number; // current size in bytes
  maxSize: number; // max size in bytes
  itemCount: number;
}

export interface CacheConfig {
  ttl: number; // time to live in milliseconds
  maxSize: number; // max cache size in bytes
  checkInterval?: number; // cleanup interval in milliseconds
}

// =============================
// Metrics Types
// =============================

export interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByTool: Record<string, number>;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number; // percentage
  evictions: number;
  totalSize: number;
  itemCount: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number; // in seconds
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cache: {
    status: "ok" | "full" | "error";
    size: number;
    maxSize: number;
  };
  timestamp: number;
}

export interface MetricsSnapshot {
  requests: RequestMetrics;
  cache: CacheMetrics;
  health: HealthStatus;
  timestamp: number;
}

// =============================
// Resource Types
// =============================

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  blob?: string;
}

export interface ResourceMetadata {
  name: string;
  description: string;
  uri: string;
  mimeType: string;
}

// =============================
// Prompt Types
// =============================

export interface PromptMessage {
  role: "user" | "assistant";
  content: {
    type: "text";
    text: string;
  };
}

export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

// =============================
// Documentation Types
// =============================

export interface DocSection {
  title: string;
  path: string;
  category?: string;
  description?: string;
}

export interface PluginMetadata {
  name: string;
  description: string;
  path: string;
  category: "official" | "community";
}
