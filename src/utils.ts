import { ScholarAPIError } from './api'

export function handleApiError(error: unknown): never {
  if (error instanceof ScholarAPIError) {
    console.error(`Error: ${error.message}`)
    if (error.statusCode === 429) {
      console.error(
        'Rate limited. Consider adding an API key with --api-key or S2_API_KEY env var.'
      )
    } else if (error.statusCode === 403) {
      console.error(
        'Access forbidden. Your API key may be invalid. Set a valid key with --api-key or S2_API_KEY env var.'
      )
    } else if (error.statusCode === 400) {
      console.error('Bad request. Check your parameters.')
    } else if (error.statusCode === 404) {
      console.error('Resource not found.')
    }
    process.exit(1)
  }
  console.error('Unexpected error:', error)
  process.exit(1)
}
