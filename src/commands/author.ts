import type { AuthorOptions } from '../types'
import { ScholarAPI } from '../api'
import { handleApiError } from '../utils'
import { DEFAULT_AUTHOR_FIELDS } from '../formatter'

export async function lookupAuthors(options: AuthorOptions): Promise<void> {
  const api = new ScholarAPI({ apiKey: options.apiKey })
  const fields = options.fields ?? DEFAULT_AUTHOR_FIELDS

  console.error(`Looking up ${options.authorIds.length} author(s)`)
  console.error(`Fields: ${fields}`)
  console.error(`Output format: ${options.output ?? 'json'}`)

  try {
    const response = await api.getAuthorsBatch(options.authorIds, fields)

    outputAuthors(response, options.output ?? 'json')
  } catch (error) {
    handleApiError(error)
  }
}

function outputAuthors(authors: any[], format: string): void {
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
