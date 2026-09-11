import type { SearchOptions, SearchPaperResponse } from '../types'
import { ScholarAPI } from '../api'
import { handleApiError } from '../utils'
import { DEFAULT_PAPER_FIELDS, formatPaperTableRow } from '../formatter'

export async function searchPapers(options: SearchOptions): Promise<void> {
  const api = new ScholarAPI({ apiKey: options.apiKey })
  const fields = options.fields ?? DEFAULT_PAPER_FIELDS

  console.error(`Searching papers: "${options.query}"`)
  console.error(`Fields: ${fields}`)
  if (options.year) console.error(`Year filter: ${options.year}`)
  if (options.minCitationCount !== undefined)
    console.error(`Min citations: ${options.minCitationCount}`)
  if (options.venue) console.error(`Venue: ${options.venue}`)
  if (options.fieldsOfStudy) console.error(`Field of study: ${options.fieldsOfStudy}`)
  console.error(`Output format: ${options.output ?? 'json'}`)

  try {
    let response: SearchPaperResponse

    if (options.all) {
      response = await fetchAllPapers(api, options, fields)
    } else {
      response = await api.searchPapersBulk(options.query, {
        fields,
        year: options.year,
        publicationTypes: options.publicationTypes,
        openAccessPdf: options.openAccessPdf,
        minCitationCount: options.minCitationCount,
        venue: options.venue,
        fieldsOfStudy: options.fieldsOfStudy
      })
    }

    if (options.limit !== undefined && !options.all) {
      response.data = response.data.slice(0, options.limit)
    }

    outputResults(response, options.output ?? 'json', options.limit)
  } catch (error) {
    handleApiError(error)
  }
}

async function fetchAllPapers(
  api: ScholarAPI,
  options: SearchOptions,
  fields: string
): Promise<SearchPaperResponse> {
  let allData: any[] = []
  let token: string | undefined
  let total = 0

  do {
    const page = await api.searchPapersBulk(options.query, {
      fields,
      year: options.year,
      publicationTypes: options.publicationTypes,
      openAccessPdf: options.openAccessPdf,
      minCitationCount: options.minCitationCount,
      venue: options.venue,
      fieldsOfStudy: options.fieldsOfStudy,
      token
    })

    total = page.total ?? allData.length
    allData = allData.concat(page.data ?? [])

    const retrieved = allData.length
    if (page.token && page.data && page.data.length > 0) {
      console.error(`Retrieved ${retrieved} of ~${total} papers...`)
    } else {
      console.error(`Done! Retrieved ${retrieved} papers total`)
    }

    if (options.limit !== undefined && allData.length >= options.limit) {
      allData = allData.slice(0, options.limit)
      console.error(`Reached limit of ${options.limit} papers`)
      break
    }

    token = page.token
  } while (token)

  return { total, data: allData }
}

function outputResults(response: SearchPaperResponse, format: string, limit?: number): void {
  const data = response.data ?? []

  if (format === 'table') {
    console.log(`Total results: ${response.total}`)
    if (limit !== undefined)
      console.log(`Showing first ${data.length} of ${response.total} results`)
    if (data.length === 0) {
      console.log('No papers found.')
      return
    }

    const rows = data.map(formatPaperTableRow)
    const headers = Object.keys(rows[0])

    const colWidths = headers.map((h) => {
      const values = rows.map((r) => r[h] ?? '')
      return Math.min(60, Math.max(h.length, ...values.map((v) => v.length)))
    })

    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ')
    console.log(headerLine)
    console.log('-'.repeat(headerLine.length))

    for (const row of rows) {
      console.log(headers.map((h, i) => (row[h] ?? '').padEnd(colWidths[i])).join(' | '))
    }
    return
  }

  if (format === 'raw') {
    process.stdout.write(JSON.stringify(response, null, 2))
    return
  }

  const output = {
    total: response.total,
    count: data.length,
    token: response.token,
    data
  }
  console.log(JSON.stringify(output, null, 2))
}
