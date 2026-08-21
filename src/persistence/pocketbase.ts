import PocketBase, { ClientResponseError } from 'pocketbase'
import { type Supermarket, type ScrapeJob, type NormalizedProduct, type ProductPrice } from '../models'

const pb = new PocketBase(process.env.PB_URL)
pb.autoCancellation(false)

let supermarketIdsBySlug: Map<string, string> | undefined

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
  const result = await request(() => pb.collection<Supermarket>('supermarkets').getFullList())
  supermarketIdsBySlug = new Map(result.map(({ slug, id }) => [slug, id]))
  return result
}

const getSupermarketId = async (slug: string): Promise<string> => {
  if (!supermarketIdsBySlug) {
    await getSupermarkets()
  }

  const id = supermarketIdsBySlug?.get(slug)
  if (!id) {
    throw new Error(`Supermercado no encontrado: ${slug}`)
  }
  return id
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

const saveRawProduct = async (supermarketRecordId: string, productRecordId: string, raw: any) => {
  return upsert('raw_products', {
    "supermarket_id": supermarketRecordId,
    "product_id": productRecordId,
    "payload": raw,
  })
}

const saveNormalizedProduct = async (product: NormalizedProduct) => {
  const supermarketId = await getSupermarketId(product.supermarket_id)
  return upsert('products', {
    ...product,
    supermarket_id: supermarketId,
  })
}

const savePrice = async (productRecordId: string, price: ProductPrice) => {
  return request(() => pb.collection('prices').create({
    ...price,
    product_id: productRecordId,
  }))
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
