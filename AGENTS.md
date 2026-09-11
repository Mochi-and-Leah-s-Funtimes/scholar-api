# AGENTS.md

## Project: ScholarAPI

TypeScript CLI for the Semantic Scholar API.

## Setup

```bash
npm install
```

## Commands

### Type checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npx prettier --check src/**/*.ts
```

### Run in development

```bash
npm run dev
# or
npx tsx src/index.ts
```

## Environment

- Node.js >= 22
- TypeScript with strict mode
- Uses native `fetch` (no HTTP library dependency)
- API key: Set `S2_API_KEY` env var or pass `--api-key <key>` flag
