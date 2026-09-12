export interface Paper {
  paperId: string
  title?: string
  url?: string
  abstract?: string
  year?: number | null
  publicationDate?: string | null
  publicationTypes?: string[] | null
  citationCount?: number
  influentialCitationCount?: number
  referenceCount?: number
  isOpenAccess?: boolean
  openAccessPdf?: { url: string; status: string } | null
  fieldsOfStudy?: string[] | null
  authors?: (Author | string)[]
  references?: Paper[]
  citations?: Citation[]
  venues?: Venue[]
  externalIds?: Record<string, string | null>
  journal?: Journal | null
  citationStyles?: CitationStyles | null
  doi?: string | null
}

export interface Citation {
  context?: string
  offset?: number | null
  sourcePaperId?: string | null
  citingPaperId?: string | null
  isInfluential?: boolean
  intents?: string[]
  isMaster?: boolean
}

export interface Author {
  authorId: string
  name?: string
  url?: string
  paperCount?: number
  hIndex?: number
  papers?: Paper[]
  citationVelocity?: number
  citedByAccumulatedGrowth?: number
  citedByAnyPaperCount?: number
  citedByPaperCount?: number
  citationCounts?: number[]
  externalIds?: Record<string, string | null>
}

export interface Venue {
  id: string
  name?: string
  type?: string
  url?: string
  alternateNames?: Record<string, string>
  issn?: string[]
  publisher?: string
  publicationDate?: string | null
  openAccess?: boolean
  isVenuesV2?: boolean
}

export interface Journal {
  name?: string
  publisher?: string
  issn?: string
  volume?: string
  publicationDate?: string
  issue?: string
  address?: string
}

export interface CitationStyles {
  apa?: string
  epmc?: string
  mla?: string
  chicago?: string
  bibtex?: string
}

export interface SearchPaperResponse {
  total: number
  offset?: number
  limit?: number
  count?: number
  token?: string
  data: Paper[]
}

export interface SearchRelevanceResponse {
  offset: number
  next?: number
  limit: number
  total: number | null
  data: Paper[]
}

export type PaperDetailsResponse = Paper

export interface RecommendationResponse {
  recommendedPapers: Paper[]
}

export type AuthorBatchResponse = Author[]

export type AuthorDetailsResponse = Author

export interface DatasetReleaseInfo {
  release_id: string
  datasets: DatasetInfo[]
}

export interface DatasetInfo {
  name: string
  description: string
  readme_url?: string | null
  files: DatasetFile[]
}

export interface DatasetFile {
  url: string
  filename: string
  file_metadata: Record<string, unknown>
}

export interface DatasetDownloadInfo {
  name: string
  description: string
  readme_url?: string | null
  files: DatasetFile[]
}

export type OutputFormat = 'json' | 'table' | 'raw' | 'agent' | 'text'

export interface SearchOptions {
  query: string
  fields?: string
  year?: string
  publicationTypes?: string
  openAccessPdf?: boolean
  minCitationCount?: number
  venue?: string
  fieldsOfStudy?: string
  limit?: number
  all?: boolean
  output?: OutputFormat
  apiKey?: string
}

export interface PaperOptions {
  paperId: string
  fields?: string
  output?: OutputFormat
  apiKey?: string
}

export interface RecommendOptions {
  positivePaperIds: string[]
  negativePaperIds?: string[]
  fields?: string
  limit?: number
  output?: OutputFormat
  apiKey?: string
}

export interface AuthorOptions {
  authorIds: string[]
  fields?: string
  output?: OutputFormat
  apiKey?: string
}
