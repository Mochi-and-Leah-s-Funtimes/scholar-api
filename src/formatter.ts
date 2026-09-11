import type { Paper } from './types'

export const DEFAULT_PAPER_FIELDS = 'title,url,publicationDate,citationCount,authors,year'
export const DEFAULT_AUTHOR_FIELDS = 'name,url,paperCount,hIndex'
export const DEFAULT_RECOMMEND_FIELDS = 'title,url,citationCount,authors'

export function formatPaperTableRow(paper: Paper): Record<string, string> {
  return {
    Title: paper.title?.slice(0, 80) ?? 'N/A',
    Year: paper.year?.toString() ?? 'N/A',
    Citations: paper.citationCount?.toString() ?? 'N/A',
    'Open Access': paper.openAccessPdf ? paper.openAccessPdf.status || 'unknown' : 'no'
  }
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len - 3) + '...' : str
}

export function escapeJsonString(str: string, maxLineLength: number = 120): string {
  const escaped = str.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()
  return truncate(escaped, maxLineLength)
}
