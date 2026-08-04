// src/supermarkets/mercadona/start.ts
import { ConsumClient } from './client'
import { ConsumNormalizer } from './normalizer'
import { BaseScraper } from '../../base/scraper'


const client = new ConsumClient()
const normalizer = new ConsumNormalizer()

const consumScraper = new BaseScraper("consum", client, normalizer)

async function main() {
  await consumScraper.run()
}

main().catch(console.error)
