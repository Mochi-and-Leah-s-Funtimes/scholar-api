import type {
  AuthorBatchResponse,
  AuthorDetailsResponse,
  DatasetDownloadInfo,
  DatasetInfo,
  DatasetReleaseInfo,
  PaperDetailsResponse,
  RecommendationResponse,
  SearchPaperResponse,
  SearchRelevanceResponse
} from './types'

const GRAPH_BASE_URL = 'https://api.semanticscholar.org/graph/v1'
const RECOMMENDATIONS_BASE_URL = 'https://api.semanticscholar.org/recommendations/v1'
const DATASETS_BASE_URL = 'https://api.semanticscholar.org/datasets/v1'

export interface S2ApiConfig {
  apiKey?: string
  baseUrl?: string
}

export class ScholarAPIError extends Error {
  public statusCode: number
  public response: unknown

  constructor(message: string, statusCode: number, response: unknown) {
    super(message)
    this.name = 'ScholarAPIError'
    this.statusCode = statusCode
    this.response = response
  }
}

export class ScholarAPI {
  private apiKey?: string
  private baseUrl: string

  constructor(config: S2ApiConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.S2_API_KEY
    this.baseUrl = config.baseUrl ?? GRAPH_BASE_URL
  }

  getApiKey(): string | undefined {
    return this.apiKey
  }

  setApiKey(key: string): void {
    this.apiKey = key
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    params?: Record<string, string | number | boolean>,
    body?: unknown,
    baseUrl?: string
  ): Promise<T> {
    const url = new URL(`${baseUrl ?? this.baseUrl}${path}`)

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      }
    }

    const headers: Record<string, string> = {}

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey
    }

    if (method === 'POST' && body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      let errorBody: unknown
      try {
        errorBody = await response.json()
      } catch {
        errorBody = await response.text()
      }
      throw new ScholarAPIError(
        `API request failed with status ${response.status}: ${response.statusText}`,
        response.status,
        errorBody
      )
    }

    return (await response.json()) as T
  }

  async searchPapersBulk(
    query: string,
    options: {
      fields?: string
      year?: string
      publicationTypes?: string
      openAccessPdf?: boolean
      minCitationCount?: number
      venue?: string
      fieldsOfStudy?: string
      token?: string
    } = {}
  ): Promise<SearchPaperResponse> {
    const params: Record<string, string | number | boolean> = { query }
    if (options.fields) params.fields = options.fields
    if (options.year) params.year = options.year
    if (options.publicationTypes) params.publicationTypes = options.publicationTypes
    if (options.openAccessPdf !== undefined) params.openAccessPdf = options.openAccessPdf
    if (options.minCitationCount !== undefined) params.minCitationCount = options.minCitationCount
    if (options.venue) params.venue = options.venue
    if (options.fieldsOfStudy) params.fieldsOfStudy = options.fieldsOfStudy
    if (options.token) params.token = options.token

    return this.request<SearchPaperResponse>('GET', '/paper/search/bulk', params)
  }

  async searchPapersRelevance(
    query: string,
    options: {
      fields?: string
      limit?: number
      offset?: number
      year?: string
      publicationTypes?: string
      openAccessPdf?: boolean
      minCitationCount?: number
      venue?: string
      fieldsOfStudy?: string
    } = {}
  ): Promise<SearchRelevanceResponse> {
    const params: Record<string, string | number | boolean> = { query }
    if (options.fields) params.fields = options.fields
    if (options.limit !== undefined) params.limit = options.limit
    if (options.offset !== undefined) params.offset = options.offset
    if (options.year) params.year = options.year
    if (options.publicationTypes) params.publicationTypes = options.publicationTypes
    if (options.openAccessPdf !== undefined) params.openAccessPdf = options.openAccessPdf
    if (options.minCitationCount !== undefined) params.minCitationCount = options.minCitationCount
    if (options.venue) params.venue = options.venue
    if (options.fieldsOfStudy) params.fieldsOfStudy = options.fieldsOfStudy

    return this.request<SearchRelevanceResponse>('GET', '/paper/search', params)
  }

  async getPaper(
    paperId: string,
    fields?: string,
    options: {
      dataType?: 'openAccessPdf'
    } = {}
  ): Promise<PaperDetailsResponse> {
    const params: Record<string, string> = {}
    if (fields) params.fields = fields
    if (options.dataType) params.dataType = options.dataType

    return this.request<PaperDetailsResponse>(
      'GET',
      `/paper/${encodeURIComponent(paperId)}`,
      params
    )
  }

  async getRecommendations(
    positivePaperIds: string[],
    options: {
      negativePaperIds?: string[]
      fields?: string
      limit?: number
    } = {}
  ): Promise<RecommendationResponse> {
    const params: Record<string, string> = {}
    if (options.fields) params.fields = options.fields
    if (options.limit !== undefined) params.limit = String(options.limit)

    const body: Record<string, string[]> = { positivePaperIds }
    if (options.negativePaperIds) body.negativePaperIds = options.negativePaperIds

    return this.request<RecommendationResponse>(
      'POST',
      '/papers',
      params,
      body,
      RECOMMENDATIONS_BASE_URL
    )
  }

  async getAuthorsBatch(authorIds: string[], fields?: string): Promise<AuthorBatchResponse> {
    const params: Record<string, string> = {}
    if (fields) params.fields = fields

    const body = { ids: authorIds }

    return this.request<AuthorBatchResponse>('POST', '/author/batch', params, body)
  }

  async getAuthor(authorId: string, fields?: string): Promise<AuthorDetailsResponse> {
    const params: Record<string, string> = {}
    if (fields) params.fields = fields

    return this.request<AuthorDetailsResponse>(
      'GET',
      `/author/${encodeURIComponent(authorId)}`,
      params
    )
  }

  async searchAuthorsBulk(
    query: string,
    fields?: string,
    options: {
      limit?: number
      offset?: number
    } = {}
  ): Promise<AuthorBatchResponse> {
    const params: Record<string, string | number> = { query }
    if (fields) params.fields = fields
    if (options.limit !== undefined) params.limit = options.limit
    if (options.offset !== undefined) params.offset = options.offset

    return this.request<AuthorBatchResponse>('GET', '/author/search/bulk', params)
  }

  async getDatasetsReleases(): Promise<DatasetReleaseInfo[]> {
    return this.request<DatasetReleaseInfo[]>('GET', '', {}, undefined, DATASETS_BASE_URL)
  }

  async getDatasetsForRelease(releaseId: string): Promise<DatasetInfo[]> {
    return this.request<DatasetInfo[]>(
      'GET',
      `/release/${encodeURIComponent(releaseId)}`,
      {},
      undefined,
      DATASETS_BASE_URL
    )
  }

  async getDatasetDownloadLinks(
    releaseId: string,
    datasetName: string
  ): Promise<DatasetDownloadInfo> {
    return this.request<DatasetDownloadInfo>(
      'GET',
      `/release/${encodeURIComponent(releaseId)}/dataset/${encodeURIComponent(datasetName)}`,
      {},
      undefined,
      DATASETS_BASE_URL
    )
  }

  async getDiffs(
    startReleaseId: string,
    endReleaseId: string,
    datasetName: string
  ): Promise<{ diffs: DiffEntry[] }> {
    return this.request<{ diffs: DiffEntry[] }>(
      'GET',
      `/diffs/${encodeURIComponent(startReleaseId)}/to/${encodeURIComponent(endReleaseId)}/${encodeURIComponent(datasetName)}`,
      {},
      undefined,
      DATASETS_BASE_URL
    )
  }
}

export interface DiffEntry {
  update_files: string[]
  delete_files: string[]
}
