import type { RecommendOptions } from '../types'
import { ScholarAPI } from '../api'
import { handleApiError } from '../utils'
import { DEFAULT_RECOMMEND_FIELDS, formatAgentOutput } from '../formatter'

export async function getRecommendations(options: RecommendOptions): Promise<void> {
  const api = new ScholarAPI({ apiKey: options.apiKey })
  const fields = options.fields ?? DEFAULT_RECOMMEND_FIELDS

  console.error(
    `Getting recommendations for ${options.positivePaperIds.length} positive paper(s)` +
      (options.negativePaperIds?.length
        ? `, ${options.negativePaperIds.length} negative paper(s)`
        : '')
  )
  console.error(`Fields: ${fields}`)
  if (options.limit) console.error(`Limit: ${options.limit}`)
  console.error(`Output format: ${options.output ?? 'json'}`)

  try {
    const response = await api.getRecommendations(options.positivePaperIds, {
      negativePaperIds: options.negativePaperIds,
      fields,
      limit: options.limit
    })

    outputRecommendations(response.recommendedPapers, options.output ?? 'json', api, options)
  } catch (error) {
    handleApiError(error)
  }
}

function outputRecommendations(
  papers: any[],
  format: string,
  api?: ScholarAPI,
  options?: RecommendOptions
): void {
  if (format === 'text') {
    const positiveCount = options?.positivePaperIds.length ?? 0
    const negativeCount = options?.negativePaperIds?.length ?? 0
    const negativeText = negativeCount > 0 ? ` and ${negativeCount} negative seed paper(s)` : ''
    console.log(
      `Found ${papers.length} recommendations based on ${positiveCount} positive seed paper(s)${negativeText}.`
    )
    if (papers.length > 0) console.log()
    papers.forEach((paper: any, i: number) => {
      console.log(`${i + 1}. ${paper.title ?? 'N/A'} (ID: ${paper.paperId ?? 'N/A'})`)
      if (paper.authors && paper.authors.length > 0) {
        const authorNames = paper.authors.map((a: any) => a.name ?? a).join(', ')
        console.log(`   Authors: ${authorNames}`)
      }
      const parts: string[] = []
      if (paper.year) parts.push(`Year: ${paper.year}`)
      if (paper.citationCount !== undefined) parts.push(`Citations: ${paper.citationCount}`)
      if (parts.length > 0) console.log(`   ${parts.join(' | ')}`)
      if (paper.url) console.log(`   URL: ${paper.url}`)
      console.log()
    })
    return
  }

  if (format === 'agent') {
    const authenticated = !!api?.getApiKey()
    const positiveCount = options?.positivePaperIds.length ?? 0
    const negativeCount = options?.negativePaperIds?.length ?? 0
    const negativeText = negativeCount > 0 ? ` and ${negativeCount} negative seed paper(s)` : ''
    const summary = `Found ${papers.length} recommendations based on ${positiveCount} positive seed paper(s)${negativeText}.`
    formatAgentOutput(
      {
        endpoint: 'recommendations/v1/papers',
        authenticated,
        fields: options?.fields ?? DEFAULT_RECOMMEND_FIELDS,
        positivePaperIds: options?.positivePaperIds ?? [],
        negativePaperIds: options?.negativePaperIds ?? [],
        limit: options?.limit ?? null
      },
      summary,
      papers
    )
    return
  }

  if (papers.length === 0) {
    console.log('No recommendations found.')
    return
  }

  if (format === 'table') {
    console.log(`Recommendations (${papers.length} papers):`)

    const widths = {
      title: 50,
      year: 6,
      citations: 10,
      authors: 40
    }

    const header = `Title${' '.repeat(widths.title)} | Year | Citations | Authors`
    console.log(header)
    console.log('-'.repeat(header.length))

    for (const paper of papers) {
      const title = (paper.title ?? 'N/A').slice(0, widths.title).padEnd(widths.title)
      const year = (paper.year?.toString() ?? 'N/A').padEnd(widths.year)
      const citations = (paper.citationCount?.toString() ?? 'N/A').padEnd(widths.citations)
      const authorNames =
        paper.authors
          ?.map((a: any) => a.name ?? a)
          .join(', ')
          .slice(0, widths.authors) ?? 'N/A'
      console.log(`${title} | ${year} | ${citations} | ${authorNames}`)
    }
    return
  }

  if (format === 'raw') {
    process.stdout.write(JSON.stringify(papers, null, 2))
    return
  }

  console.log(JSON.stringify(papers, null, 2))
}
