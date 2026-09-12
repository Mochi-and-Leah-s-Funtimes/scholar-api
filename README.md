# ScholarAPI

A TypeScript CLI for the [Semantic Scholar API](https://www.semanticscholar.org/product/api).

## Installation

```bash
npm install
```

## Quick Start

```bash
npm run dev
```

This shows the help:

```
scholar <command> [options]
```

## API Key

An API key is **recommended** but optional. Without a key, requests are shared and rate-limited quickly. Set your key via:

1. **Local `.env` file** (auto-loaded):

   ```bash
   echo "S2_API_KEY=your-api-key-here" >> .env
   ```

   Copy `.env.example` to `.env` and fill in your key.

2. **Environment variable**:

   ```bash
   export S2_API_KEY=your-api-key-here
   ```

3. **CLI flag**:

   ```bash
   npx tsx src/index.ts search "ai" --api-key your-api-key-here
   ```

Get a key at https://www.semanticscholar.org/product/api#api-key-form

## Commands

### Search for papers

Keyword search using the bulk search endpoint (supports boolean query syntax, pagination via tokens):

```bash
npx tsx src/index.ts search "generative ai" --year 2024 --output table
npx tsx src/index.ts search "cloud computing +security -privacy" --limit 10
npx tsx src/index.ts search "red blood cell" --fields-of-study biology --output json
npx tsx src/index.ts search "generative ai" --all --limit 50 --output json
```

**Options:**

| Option | Description |
|--------|-------------|
| `--fields <fields>` | Comma-separated fields to return |
| `--year <range>` | Year filter (e.g. `2023-`, `2020-2022`) |
| `--publication-types <types>` | Filter by publication types |
| `--open-access` | Filter for open access papers only |
| `--min-citation-count <n>` | Minimum citation count |
| `--venue <venue>` | Filter by publication venue |
| `--fields-of-study <fields>` | Filter by field of study |
| `--limit <n>` | Limit number of results (client-side; default from API) |
| `--all` | Fetch all results by following pagination tokens |
| `--output <format>` | Output format: `json`, `table`, `raw`, `agent` (default) |

### Get paper details

```bash
npx tsx src/index.ts paper 649def34f8be52c8b66281af98ae884c09aef38b
npx tsx src/index.ts paper 649def34f8be52c8b66281af98ae884c09aef38b --fields title,abstract,citationCount --output table
npx tsx src/index.ts paper "CorpusID:123456"  # DOI or other paper ID formats
```

**Options:**

| Option | Description |
|--------|-------------|
| `--fields <fields>` | Comma-separated fields to return |
| `--output <format>` | Output format: `json`, `table`, `raw`, `agent` (default) |

### Get paper recommendations

```bash
npx tsx src/index.ts recommend 02138d6d094d1e7511c157f0b1a3dd4e5b20ebee 018f58247a20ec6b3256fd3119f57980a6f37748
npx tsx src/index.ts recommend 02138d6d094d1e7511c157f0b1a3dd4e5b20ebee --negative 0045ad0c1e14a4d1f4b011c92eb36b8df63d65bc --limit 10 --output table
```

**Options:**

| Option | Description |
|--------|-------------|
| `--negative <ids...>` | Negative seed paper IDs to exclude |
| `--fields <fields>` | Comma-separated fields to return |
| `--limit <n>` | Limit number of recommendations (max: 500) |
| `--output <format>` | Output format: `json`, `table`, `raw`, `agent` (default) |

### Look up authors

```bash
npx tsx src/index.ts author 2281351310 2281342663
npx tsx src/index.ts author 2281351310 --fields name,url,paperCount,hIndex,papers --output table
```

**Options:**

| Option | Description |
|--------|-------------|
| `--fields <fields>` | Comma-separated fields to return |
| `--output <format>` | Output format: `json`, `table`, `raw`, `agent` (default) |

## Output Formats

- **`text`** (default): Concise, human-readable key-value output — minimal token usage
- **`agent`**: Structured JSON with `meta`, `summary`, and `data` sections — for AI agent consumption
- **`json`**: Pretty-printed JSON with metadata
- **`table`**: Human-readable formatted tables
- **`raw`**: Raw API response as-is

## Rate Limiting

The CLI automatically enforces a **1 request per second** rate limit (matching the Semantic Scholar API's authenticated rate limit). When fetching multiple pages with `--all`, the CLI will pause between requests and display a message.

Without an API key, all unauthenticated users share a single rate limit, which may result in `429 Too Many Requests` errors. Using an API key provides dedicated rate limiting.

**Agent output example:**

```bash
npx tsx src/index.ts search "generative ai" --limit 3 --year 2024 --output agent
```

```json
{
  "format": "agent",
  "meta": {
    "endpoint": "paper/search/bulk",
    "authenticated": false,
    "fields": "title,url,publicationDate,citationCount,authors,year",
    "query": "generative ai",
    "year": "2024"
  },
  "summary": "Found 11329 papers matching 'generative ai'. Showing 3 of 11329 results.",
  "data": [...]
}
```

## Development

```bash
npm install        # Install dependencies
npx tsc --noEmit   # Type checking
npx prettier --check src/**/*.ts  # Linting
npx tsx src/index.ts  # Run directly (dev)
npx tsc && node dist/index.js  # Run compiled
```

## Architecture

```
src/
  index.ts          # CLI entry point (commander.js + dotenv loading)
  api.ts            # Semantic Scholar API client (native fetch + rate limiting)
  types.ts          # TypeScript interfaces
  formatter.ts      # Output formatting helpers (table, agent)
  utils.ts          # Shared utilities (error handler)
  commands/
    search.ts       # Paper search (bulk search + pagination)
    paper.ts        # Paper details lookup
    recommend.ts    # Paper recommendations
    author.ts       # Author lookup
```

### API Endpoints Used

| API | Endpoint | Method |
|-----|----------|--------|
| Academic Graph | `/paper/search/bulk` | GET |
| Academic Graph | `/paper/{paper_id}` | GET |
| Academic Graph | `/author/batch` | POST |
| Recommendations | `/papers` | POST |

Base URLs:
- Academic Graph: `https://api.semanticscholar.org/graph/v1`
- Recommendations: `https://api.semanticscholar.org/recommendations/v1`
- Datasets: `https://api.semanticscholar.org/datasets/v1`

## License

ISC
