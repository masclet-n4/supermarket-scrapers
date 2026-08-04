import PocketBase, { ClientResponseError } from 'pocketbase'
import { type Supermarket, type ScrapeJob, type NormalizedProduct, type ProductPrice } from '../models'

const pb = new PocketBase(process.env.PB_URL)
pb.autoCancellation(false)

const authenticate = async () => {
  const email = process.env.PB_EMAIL
  const password = process.env.PB_PASSWORD

  if (!email || !password) {
    throw new Error('PB_EMAIL y PB_PASSWORD son obligatorias')
  }

  console.log('[PocketBase] Autenticando superusuario...')
  await pb.collection('_superusers').authWithPassword(email, password)
  console.log('[PocketBase] Superusuario autenticado correctamente')
}

const request = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn()
  } catch (error: any) {
    if (error?.status === 401 || error?.status === 403) {
      console.warn(`[PocketBase] Token inválido (${error.status}); reautenticando...`)
      await authenticate()
      return fn()
    }
    throw error
  }
}

await authenticate()

const getSupermarkets = async (): Promise<Supermarket[]> => {
  const result = await request(() => pb.collection<Supermarket>('supermarkets').getList())
  return result.items
}

const createJob = async (supermarketId: string, startedAt: Date): Promise<ScrapeJob> => {
  const job = await request(() => pb.collection<ScrapeJob>('jobs').create({
      "type": `scrape:${supermarketId}`,
      "status": "running",
      "start_date": startedAt.toISOString(),
      "end_date": null,
      "errors": [],
      "details": {},
  }))
  return job
}

const upsert = async (
  collection: string,
  data: any,
) => {
  const filter = pb.filter(
    'product_id = {:productId}',
    { productId: String(data.product_id) },
  )

  let existing

  try {
    existing = await request(() => pb.collection(collection).getFirstListItem(filter))
  } catch (error: unknown) {
    if (!(error instanceof ClientResponseError) || error.status !== 404) {
      throw error
    }
  }

  if (existing) {
    return request(() => pb.collection(collection).update(existing.id, data))
  }

  return request(() => pb.collection(collection).create(data))
}

const saveRawProduct = async (supermarketId: string, productId: string, raw: any) => {
  try {
    const response = await upsert('raw_products', {
      "supermarket_id": supermarketId,
      "product_id": productId,
      "scraped_at": new Date().toISOString(),
      "payload": raw,
    })
    return response
  } catch (error) {
    throw error
  }
}

const saveNormalizedProduct = async (product: NormalizedProduct) => {
  try {
    const response = await upsert('products', product)
    return response
  } catch (error) {
    throw error
  }
}

const savePrice = async (price: ProductPrice) => {
  try {
    const response = await request(() => pb.collection('prices').create(price))
    return response
  } catch (error) {
    throw error
  }
}

const updateJob = async (jobId: string, payload: any) => {
  await request(() => pb.collection<ScrapeJob>('jobs').update(jobId, payload))
}

export default {
  getSupermarkets,
  createJob,
  saveRawProduct,
  saveNormalizedProduct,
  updateJob,
  savePrice}
