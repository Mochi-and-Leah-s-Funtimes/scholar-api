import type { PaperOptions } from '../types'
import { ScholarAPI } from '../api'
import { handleApiError } from '../utils'
import { DEFAULT_PAPER_FIELDS, formatAgentOutput } from '../formatter'

export async function getPaperDetails(options: PaperOptions): Promise<void> {
  const api = new ScholarAPI({ apiKey: options.apiKey })
  const fields = options.fields ?? DEFAULT_PAPER_FIELDS

  console.error(`Fetching paper: ${options.paperId}`)
  console.error(`Fields: ${fields}`)

  try {
    const response = await api.getPaper(options.paperId, fields)

    outputPaper(response, options.output ?? 'json', api, options.paperId, fields)
  } catch (error) {
    handleApiError(error)
  }
}

function outputPaper(
  paper: any,
  format: string,
  api?: ScholarAPI,
  paperId?: string,
  fields?: string
): void {
  if (format === 'text') {
    console.log(`Title:  ${paper.title ?? 'N/A'}`)
    if (paper.authors && paper.authors.length > 0) {
      const authorNames = paper.authors.map((a: any) => a.name ?? a).join(', ')
      console.log(`Authors: ${authorNames}`)
    }
    if (paper.year) console.log(`Year:   ${paper.year}`)
    if (paper.citationCount !== undefined) console.log(`Citations: ${paper.citationCount}`)
    if (paper.influentialCitationCount !== undefined)
      console.log(`Influential Citations: ${paper.influentialCitationCount}`)
    if (paper.referenceCount !== undefined) console.log(`References: ${paper.referenceCount}`)
    if (paper.publicationDate) console.log(`Published: ${paper.publicationDate}`)
    if (paper.publicationTypes && paper.publicationTypes.length > 0)
      console.log(`Types:  ${paper.publicationTypes.join(', ')}`)
    if (paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0)
      console.log(`Fields: ${paper.fieldsOfStudy.join(', ')}`)
    if (paper.url) console.log(`URL:    ${paper.url}`)
    if (paper.journal?.name) console.log(`Journal: ${paper.journal.name}`)
    if (paper.abstract) {
      console.log(`\nAbstract:\n${paper.abstract}`)
    }
    return
  }

  if (format === 'agent') {
    const authenticated = !!api?.getApiKey()
    const title = paper.title ?? 'Unknown'
    const summary = `Retrieved details for paper '${title}' (ID: ${paperId ?? 'N/A'}).`
    formatAgentOutput(
      {
        endpoint: 'paper/{paper_id}',
        authenticated,
        fields: fields ?? '',
        paperId: paperId ?? ''
      },
      summary,
      paper
    )
    return
  }
  if (format === 'table') {
    console.log('Paper Details:')
    console.log(`  Title:  ${paper.title ?? 'N/A'}`)
    console.log(`  Year:   ${paper.year ?? 'N/A'}`)
    console.log(`  URL:    ${paper.url ?? 'N/A'}`)
    console.log(`  Pub Date: ${paper.publicationDate ?? 'N/A'}`)
    console.log(`  Abstract: ${paper.abstract ?? 'N/A'}`)
    console.log(`  Citation Count: ${paper.citationCount ?? 'N/A'}`)
    console.log(`  Influential Citations: ${paper.influentialCitationCount ?? 'N/A'}`)
    console.log(`  Reference Count: ${paper.referenceCount ?? 'N/A'}`)

    if (paper.publicationTypes && paper.publicationTypes.length > 0) {
      console.log(`  Types:  ${paper.publicationTypes.join(', ')}`)
    }

    if (paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0) {
      console.log(`  Fields: ${paper.fieldsOfStudy.join(', ')}`)
    }

    if (paper.authors && paper.authors.length > 0) {
      console.log('  Authors:')
      for (const author of paper.authors) {
        if (typeof author === 'object') {
          console.log(`    - ${author.name ?? 'Unknown'} (ID: ${author.authorId ?? 'N/A'})`)
        } else {
          console.log(`    - ${author}`)
        }
      }
    }

    if (paper.journal) {
      console.log(`  Journal: ${paper.journal.name ?? 'N/A'}`)
      if (paper.journal.volume) console.log(`  Volume: ${paper.journal.volume}`)
      if (paper.journal.issue) console.log(`  Issue: ${paper.journal.issue}`)
    }

    if (paper.externalIds) {
      console.log('  External IDs:')
      for (const [key, value] of Object.entries(paper.externalIds)) {
        if (value) console.log(`    ${key}: ${value}`)
      }
    }
    return
  }

  if (format === 'raw') {
    process.stdout.write(JSON.stringify(paper, null, 2))
    return
  }

  console.log(JSON.stringify(paper, null, 2))
}
