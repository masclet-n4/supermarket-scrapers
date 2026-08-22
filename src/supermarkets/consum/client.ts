
import { type IBaseClient } from '../../base/client'
import type { ConsumProduct, ConsumProductList } from './models';
import { perPage, productsUrl } from './enums';
import { fetchWithErrorHandling, getRandomNumberBetween } from '../../utils';
import { sleep } from 'bun';

export class ConsumClient implements IBaseClient<ConsumProduct> {
  constructor() { }

  async *fetchProducts(): AsyncIterable<ConsumProduct> {

    let hasMore = true;
    let page = 1;

    while (hasMore) {
      const waitTime = getRandomNumberBetween(200, 500)
      await sleep(waitTime)
      const response = await fetchWithErrorHandling(
        `${productsUrl}?limit=${perPage}&page=${page * perPage}&offset=${(page - 1) * perPage}`,
        undefined,
        { 504: (attempt) => [5_000, 15_000][attempt] },
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.url}`)
      const data: ConsumProductList = await response.json() as ConsumProductList
      hasMore = data.hasMore;
      for (const product of data.products) {
        yield product
      }
      page++
    }
  }
}
