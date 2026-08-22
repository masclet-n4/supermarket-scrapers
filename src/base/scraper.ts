
import type { IBaseClient, ProductErrorHandler } from './client'
import type { IBaseNormalizer } from './normalizer'

import pb from "../persistence/pocketbase.ts"
import type { ScrapeJob, ScrapeJobError, ScrapeJobStatus } from '../models.ts'

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

  async _processProduct(raw: any, errors: ScrapeJobError[]): Promise<boolean> {
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
         message: error.message,
         code: 'product_error',
         stage: 'process',
         entity_id: productId,
         stack_trace: error.stack ?? '',
       })
      return false
    }
  }

  async _endJob(
    jobId: string | null,
    startedAt: Date,
    status: ScrapeJobStatus,
    productsProcessed: number,
    productsSaved: number,
    errors: ScrapeJobError[]): Promise<void>
  {
    const finishedAt = new Date();
    const summary = {
      schema_version: 1,
      products_processed: productsProcessed,
      products_saved: productsSaved,
      products_failed: errors.length,
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
    }

    if (jobId) {
      await pb.updateJob(jobId, {
        status: status === 'completed' && errors.length > 0
          ? 'completed_with_errors'
          : status,
        end_date: finishedAt.toISOString(),
        errors: errors.length === 0
          ? [{ code: 'none', message: 'No errors', stage: 'complete' }]
          : errors,
        details: summary,
      })
    }
  }

  async run(): Promise<void> {
    const startedAt = new Date()
    let productProcessed = 0
    let productsSaved = 0
    const errors: ScrapeJobError[] = []
    let status: ScrapeJobStatus = 'failed'

    console.log(`[${this.supermarket}] Scraper started`)
    const jobId = await this._createJob(startedAt)

    try {
      const onProductError: ProductErrorHandler = ({ productId, error }) => {
        const cause = error instanceof Error ? error : new Error(String(error))
        productProcessed++
        errors.push({
          message: cause.message,
          code: 'product_error',
          stage: 'fetch',
          entity_id: `${this.supermarket}:${productId}`,
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
      const cause = error instanceof Error ? error : new Error(String(error))
      errors.push({
        message: cause.message,
        code: 'scraper_error',
        stage: 'run',
        stack_trace: cause.stack ?? '',
      })
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
