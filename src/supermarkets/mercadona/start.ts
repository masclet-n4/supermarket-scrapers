// src/supermarkets/mercadona/start.ts
import { MercadonaClient } from './client'
import { MercadonaNormalizer } from './normalizer'
import { BaseScraper } from '../../base/scraper'


const client = new MercadonaClient()
const normalizer = new MercadonaNormalizer()

const mercadonaScraper = new BaseScraper("mercadona", client, normalizer)

async function main() {
  await mercadonaScraper.run()
}

main().catch(console.error)
