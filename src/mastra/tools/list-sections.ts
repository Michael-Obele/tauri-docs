import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { fetchDocsIndex, parseDocsIndex } from '../lib/llms-txt';

export const listSectionsTool = createTool({
  id: 'list_sections',
  description: 'List all available Tauri documentation sections from llms.txt',
  inputSchema: z.object({}),
  outputSchema: z.object({
    sections: z.array(
      z.object({
        category: z.string(),
        pages: z.array(
          z.object({
            title: z.string(),
            path: z.string(),
            description: z.string().optional(),
          })
        ),
      })
    ),
  }),
  execute: async () => {
    const raw = await fetchDocsIndex();
    const sections = parseDocsIndex(raw);
    return { sections };
  },
});
