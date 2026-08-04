import { sleep } from 'bun'
import { type IBaseClient } from '../../base/client'
import { categoriesUrl, headers, productsUrl } from './enums'
import { getRandomNumberBetween } from '../../utils'
import type {
  MercadonaCategoriesResponse,
  MercadonaCategoryResponse,
  MercadonaFullProduct,
} from './models'



export class MercadonaClient implements IBaseClient<MercadonaFullProduct> {
  constructor() {
  }

  async _fetchCategories(): Promise<MercadonaCategoriesResponse> {
    const response = await fetch(categoriesUrl, {
      headers,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.url}`)
    }

    return await response.json() as MercadonaCategoriesResponse
  }

  async _fetchSubcategoryProducts<T>(
    subcategoryId: number,
  ): Promise<MercadonaCategoryResponse> {
    const response = await fetch(`${categoriesUrl}${subcategoryId}/`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.url}`)
    }

    return await response.json() as MercadonaCategoryResponse
  }

  async _fetchFullProduct(productId: string): Promise<MercadonaFullProduct> {
    const response = await fetch(`${productsUrl}/${productId}/`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.url}`)
    }

    return await response.json() as MercadonaFullProduct
  }

  async _fetchCategoryProducts(categoryId: string): Promise<unknown> {
    throw new Error(`Not implemented: category ${categoryId}`)
  }

  async *fetchProducts(): AsyncIterable<MercadonaFullProduct> {
    const categories = await this._fetchCategories()

    for (const category of categories.results) {
      const subcategories = category.categories;
      for (const subcategory of subcategories) {
      const waitTime = getRandomNumberBetween(100, 300)
      await sleep(waitTime)
      const subcategoriesProducts = await this._fetchSubcategoryProducts(subcategory.id)
        for (const subcategoryProducts of subcategoriesProducts.categories) {
          for (const product of subcategoryProducts.products) {
            const waitTime = getRandomNumberBetween(100, 300)
            await sleep(waitTime)
            const fullProduct = await this._fetchFullProduct(product.id)
            yield fullProduct
          }
        }

      }
    }

  }
}
