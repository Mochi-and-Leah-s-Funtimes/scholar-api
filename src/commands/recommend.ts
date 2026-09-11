import type { RecommendOptions } from '../types'
import { ScholarAPI } from '../api'
import { handleApiError } from '../utils'
import { DEFAULT_RECOMMEND_FIELDS } from '../formatter'

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

    outputRecommendations(response.recommendedPapers, options.output ?? 'json')
  } catch (error) {
    handleApiError(error)
  }
}

function outputRecommendations(papers: any[], format: string): void {
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
