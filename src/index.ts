import { BaseScraper } from './base/scraper'
import pb from './persistence/pocketbase'
import { ConsumClient } from './supermarkets/consum/client'
import { ConsumNormalizer } from './supermarkets/consum/normalizer'
import { MercadonaClient } from './supermarkets/mercadona/client'
import { MercadonaNormalizer } from './supermarkets/mercadona/normalizer'

const env = process.env

console.log("Init scheduling")
console.log(`PocketBase: ${env.PB_URL}`)


const supermarkets = await pb.getSupermarkets()

const mercadonaScraper = new BaseScraper("mercadona", new MercadonaClient, new MercadonaNormalizer)
const consumScraper = new BaseScraper("consum", new ConsumClient, new ConsumNormalizer)

const MAPPED_SCRAPERS = {
  mercadona: mercadonaScraper,
  consum: consumScraper,
}

for (const supermarket of supermarkets) {
  const scheduleScraper = supermarket.scraper_schedule
  if (supermarket.enabled && scheduleScraper) {
    const scraper = MAPPED_SCRAPERS[supermarket.slug as keyof typeof MAPPED_SCRAPERS]

    if (!scraper) {
      console.warn(`No scraper configured for ${supermarket.slug}`)
      continue
    }

    const nextRun = Bun.cron.parse(scheduleScraper)

    console.log(
      `Scheduling scraper for ${supermarket.name} ` +
      `(${scheduleScraper}) - next run: ${nextRun?.toLocaleString() ?? 'unknown'}`,
    )

    Bun.cron(scheduleScraper, async () => {
      try {
          await scraper.run()
        } finally {
          const nextRun = Bun.cron.parse(scheduleScraper)

          console.log(
            `[${supermarket.name}] Next scrape: ` +
            `${nextRun?.toLocaleString() ?? 'unknown'}`,
          )
        }
    })
  }
}
