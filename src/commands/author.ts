import type { AuthorOptions } from '../types'
import { ScholarAPI } from '../api'
import { handleApiError } from '../utils'
import { DEFAULT_AUTHOR_FIELDS, formatAgentOutput } from '../formatter'

export async function lookupAuthors(options: AuthorOptions): Promise<void> {
  const api = new ScholarAPI({ apiKey: options.apiKey })
  const fields = options.fields ?? DEFAULT_AUTHOR_FIELDS

  console.error(`Looking up ${options.authorIds.length} author(s)`)
  console.error(`Fields: ${fields}`)
  console.error(`Output format: ${options.output ?? 'json'}`)

  try {
    const response = await api.getAuthorsBatch(options.authorIds, fields)

    outputAuthors(response, options.output ?? 'json', api, options.authorIds, fields)
  } catch (error) {
    handleApiError(error)
  }
}

function outputAuthors(
  authors: any[],
  format: string,
  api?: ScholarAPI,
  authorIds?: string[],
  requestedFields?: string
): void {
  if (format === 'text') {
    console.log(`Found ${authors.length} author(s):`)
    console.log()
    authors.forEach((author: any, i: number) => {
      console.log(`${i + 1}. ${author.name ?? 'N/A'} (ID: ${author.authorId ?? 'N/A'})`)
      const parts: string[] = []
      if (author.paperCount !== undefined) parts.push(`Papers: ${author.paperCount}`)
      if (author.hIndex !== undefined) parts.push(`H-Index: ${author.hIndex}`)
      if (author.citationCount !== undefined) parts.push(`Citations: ${author.citationCount}`)
      if (author.citationVelocity !== undefined) parts.push(`Velocity: ${author.citationVelocity}`)
      if (parts.length > 0) console.log(`   ${parts.join(' | ')}`)
      if (author.url) console.log(`   URL: ${author.url}`)
      if (author.papers && author.papers.length > 0) {
        console.log(`   Recent papers:`)
        author.papers.slice(0, 5).forEach((p: any) => {
          console.log(`   - ${p.title ?? p.paperId ?? 'N/A'}`)
        })
      }
      console.log()
    })
    return
  }

  if (format === 'agent') {
    const authenticated = !!api?.getApiKey()
    const summary = `Found ${authors.length} author(s) for ${authorIds?.length ?? 0} ID(s) requested.`
    formatAgentOutput(
      {
        endpoint: 'author/batch',
        authenticated,
        fields: requestedFields ?? '',
        requestedIds: authorIds ?? []
      },
      summary,
      authors
    )
    return
  }
  if (authors.length === 0) {
    console.log('No authors found.')
    return
  }

  if (format === 'table') {
    console.log(`Authors (${authors.length}):`)

    const colWidths = {
      name: 40,
      id: 25,
      papers: 8,
      hindex: 8
    }

    const header = `Name${' '.repeat(colWidths.name)} | Author ID${' '.repeat(colWidths.id - 9)} | Papers | H-Index`
    console.log(header)
    console.log('-'.repeat(header.length))

    for (const author of authors) {
      const name = (author.name ?? 'N/A').slice(0, colWidths.name).padEnd(colWidths.name)
      const id = (author.authorId ?? 'N/A').slice(0, colWidths.id).padEnd(colWidths.id)
      const papers = (author.paperCount?.toString() ?? 'N/A').padEnd(colWidths.papers)
      const hIndex = (author.hIndex?.toString() ?? 'N/A').padEnd(colWidths.hindex)
      console.log(`${name} | ${id} | ${papers} | ${hIndex}`)
    }
    return
  }

  if (format === 'raw') {
    process.stdout.write(JSON.stringify(authors, null, 2))
    return
  }

  console.log(JSON.stringify(authors, null, 2))
}
