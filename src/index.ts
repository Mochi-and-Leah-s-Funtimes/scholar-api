#!/usr/bin/env node
import 'dotenv/config'
import { Command, type OptionValues } from 'commander'
import { searchPapers } from './commands/search'
import { getPaperDetails } from './commands/paper'
import { getRecommendations } from './commands/recommend'
import { lookupAuthors } from './commands/author'

const program = new Command()

program
  .name('scholar')
  .description('CLI for the Semantic Scholar API')
  .version('1.0.0')
  .option('--api-key <key>', 'Semantic Scholar API key (or set S2_API_KEY env var)')

program
  .command('search')
  .description('Search for papers using keyword search (bulk search endpoint)')
  .argument('<query>', 'search query (use quotes for exact phrases)')
  .option(
    '--fields <fields>',
    'comma-separated fields to return',
    'title,url,publicationDate,citationCount,authors,year'
  )
  .option('--year <range>', 'filter by year range (e.g. "2023-", "2020-2022")')
  .option('--publication-types <types>', 'filter by publication types (comma-separated)')
  .option('--open-access', 'filter for open access papers only')
  .option('--min-citation-count <n>', 'minimum citation count')
  .option('--venue <venue>', 'filter by publication venue')
  .option('--fields-of-study <fields>', 'filter by field of study')
  .option('--limit <n>', 'limit number of results (default: 100)')
  .option('--all', 'fetch all results by following pagination tokens')
  .option('--output <format>', 'output format: json | table | raw', 'json')
  .action((query: string, opts: OptionValues) => {
    searchPapers({
      query,
      fields: opts.fields,
      year: opts.year,
      publicationTypes: opts.publicationTypes,
      openAccessPdf: opts.openAccess ? true : undefined,
      minCitationCount:
        opts.minCitationCount !== undefined ? Number(opts.minCitationCount) : undefined,
      venue: opts.venue,
      fieldsOfStudy: opts.fieldsOfStudy,
      limit: opts.limit !== undefined ? Number(opts.limit) : undefined,
      all: opts.all,
      output: opts.output as any,
      apiKey: program.opts().apiKey
    })
  })

program
  .command('paper')
  .description('Get details about a specific paper by ID')
  .argument('<paperId>', 'paper ID (or DOI)')
  .option('--fields <fields>', 'comma-separated fields to return')
  .option('--output <format>', 'output format: json | table | raw', 'json')
  .action((paperId: string, opts: OptionValues) => {
    getPaperDetails({
      paperId,
      fields: opts.fields,
      output: opts.output as any,
      apiKey: program.opts().apiKey
    })
  })

program
  .command('recommend')
  .description('Get paper recommendations based on seed papers')
  .argument('<paperIds...>', 'positive seed paper IDs')
  .option('--negative <ids...>', 'negative seed paper IDs')
  .option('--fields <fields>', 'comma-separated fields to return')
  .option('--limit <n>', 'limit number of recommendations (max: 500)')
  .option('--output <format>', 'output format: json | table | raw', 'json')
  .action((paperIds: string[], opts: OptionValues) => {
    getRecommendations({
      positivePaperIds: paperIds,
      negativePaperIds: opts.negative,
      fields: opts.fields,
      limit: opts.limit !== undefined ? Number(opts.limit) : undefined,
      output: opts.output as any,
      apiKey: program.opts().apiKey
    })
  })

program
  .command('author')
  .description('Look up authors by ID')
  .argument('<authorIds...>', 'author IDs')
  .option('--fields <fields>', 'comma-separated fields to return', 'name,url,paperCount,hIndex')
  .option('--output <format>', 'output format: json | table | raw', 'json')
  .action((authorIds: string[], opts: OptionValues) => {
    lookupAuthors({
      authorIds,
      fields: opts.fields,
      output: opts.output as any,
      apiKey: program.opts().apiKey
    })
  })

program.parse()
