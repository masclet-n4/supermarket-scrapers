
import type { IBaseClient, ProductErrorHandler } from './client'
import type { IBaseNormalizer } from './normalizer'

import pb from "../persistence/pocketbase.ts"
import type { ScrapeJob } from '../models.ts'

interface IBaseScraper {
  supermarket: string
  client: IBaseClient<any>
  normalizer: IBaseNormalizer
}

export class BaseScraper implements IBaseScraper {
  constructor(
    public supermarket: string,
    public client: IBaseClient<any>,
    public normalizer: IBaseNormalizer,
  ) { }


  async _createJob(startedAt: Date): Promise<string | null> {
    try {
      const job: ScrapeJob = await pb.createJob(this.supermarket, startedAt)
      return job?.id || null
    } catch (error) {
      console.error(`[${this.supermarket}] Failed to create job`, error)
      throw error
    }
  }

  async _processProduct(raw: any, errors: any): Promise<boolean> {
    const productId = `${this.supermarket}:${this.normalizer.extractInternalId(raw)}`

    try {
       const normalizedProduct = this.normalizer.normalize(raw)
       normalizedProduct.product_id = productId
       const savedProduct = await pb.saveNormalizedProduct(normalizedProduct)

       await pb.saveRawProduct(savedProduct.supermarket_id, savedProduct.id, raw)

       const normalizedPrice = this.normalizer.normalizePrice(raw)
       normalizedPrice.product_id = productId
       await pb.savePrice(savedProduct.id, normalizedPrice)

      console.log(`[${this.supermarket}] Product ${productId} processed`)
      return true
    } catch (error: any) {
      console.error(`[${this.supermarket}] Product ${productId} failed`, error)
      errors.push({
        product_id: productId,
        message: error.message,
        stack_trace: error.stack ?? '',
      })
      return false
    }
  }

  async _endJob(
    jobId: string | null,
    startedAt: Date,
    status: string,
    productsProcessed: number,
    productsSaved: number,
    errors: any[]): Promise<void>
  {
    const finishedAt = new Date();
    const summary = {
      products_processed: productsProcessed,
      products_saved: productsSaved,
      errors_count: errors.length,
      "duration_seconds": Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)
    }

    if (jobId) {
      await pb.updateJob(jobId, {
        status: status,
        end_date: finishedAt.toISOString(),
        errors: errors,
        details: summary,
      })
    }
  }

  async run(): Promise<void> {
    const startedAt = new Date()
    let productProcessed = 0
    let productsSaved = 0
    const errors: any[] = []
    let status = 'failed'

    console.log(`[${this.supermarket}] Scraper started`)
    const jobId = await this._createJob(startedAt)

    try {
      const onProductError: ProductErrorHandler = ({ productId, error }) => {
        const cause = error instanceof Error ? error : new Error(String(error))
        productProcessed++
        errors.push({
          product_id: `${this.supermarket}:${productId}`,
          message: cause.message,
          stack_trace: cause.stack ?? '',
        })
      }

      for await (const product of this.client.fetchProducts(onProductError)) {
        productProcessed++
        if (await this._processProduct(product, errors)) {
          productsSaved++
        }
      }
      status = errors.length > 0 ? 'completed_with_errors' : 'completed'
    } catch (error) {
      console.error(`[${this.supermarket}] Scraper failed`, error)
    } finally {
      console.log(
        `[${this.supermarket}] Scraper finished: ` +
        `${productProcessed} processed, ${productsSaved} saved, ` +
        `${errors.length} errors`,
      )
      await this._endJob(jobId, startedAt, status, productProcessed, productsSaved, errors)
    }
  }
}
