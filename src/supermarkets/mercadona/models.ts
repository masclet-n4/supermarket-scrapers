export interface MercadonaPage<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface MercadonaCategorySummary {
  id: number
  name: string
  order: number
  layout: number
  published: boolean
  is_extended: boolean
}

export interface MercadonaCategory {
  id: number
  name: string
  order: number
  is_extended: boolean
  categories: MercadonaCategorySummary[]
  icon_url: string | null
}

export type MercadonaCategoriesResponse = MercadonaPage<MercadonaCategory>

export interface MercadonaBadges {
  is_water: boolean
  requires_age_check: boolean
}

export interface MercadonaProductCategory {
  id: number
  name: string
  level: number
  order: number
}

export interface MercadonaPriceInstructions {
  iva: number | null
  is_new: boolean
  is_pack: boolean
  pack_size: number | null
  unit_name: string | null
  unit_size: number | null
  bulk_price: string | null
  unit_price: string
  approx_size: boolean
  size_format: string | null
  total_units: number | null
  unit_selector: boolean
  bunch_selector: boolean
  drained_weight: number | null
  selling_method: number
  tax_percentage: string
  price_decreased: boolean
  reference_price: string | null
  min_bunch_amount: number | null
  reference_format: string | null
  previous_unit_price: string | null
  increment_bunch_amount: number | null
}

export interface MercadonaProductSummary {
  id: string
  slug: string
  limit: number
  badges: MercadonaBadges
  status: string | null
  packaging: string | null
  published: boolean
  share_url: string
  thumbnail: string
  categories: MercadonaProductCategory[]
  display_name: string
  main_feature?: string
  unavailable_from: string | null
  price_instructions: MercadonaPriceInstructions
  unavailable_weekdays: number[]
  is_new_arrival: boolean
}

export interface MercadonaCategoryDetail extends MercadonaCategorySummary {
  image: string | null
  subtitle: string | null
  products: MercadonaProductSummary[]
}

export interface MercadonaCategoryResponse extends MercadonaCategorySummary {
  categories: MercadonaCategoryDetail[]
}

export interface MercadonaSupplier {
  name: string
}

export interface MercadonaProductDetails {
  brand: string | null
  origin: string | null
  suppliers: MercadonaSupplier[]
  legal_name: string | null
  description: string | null
  counter_info: string | null
  danger_mentions: string | null
  alcohol_by_volume: number | null
  mandatory_mentions: string | null
  production_variant: string | null
  usage_instructions: string | null
  storage_instructions: string | null
  is_prepared_by_mercadona: boolean
}

export interface MercadonaPhoto {
  zoom: string
  regular: string
  thumbnail: string
  perspective: number
}

export interface MercadonaFullProductCategory {
  id: number
  name: string
  level: number
  order: number
  categories?: MercadonaFullProductCategory[]
}

export type MercadonaFullProduct = Omit<
  MercadonaProductSummary,
  'categories'
> & {
  ean: string
  brand: string | null
  origin: string | null
  photos: MercadonaPhoto[]
  details: MercadonaProductDetails
  is_bulk: boolean
  categories: MercadonaFullProductCategory[]
  extra_info: string[]
  nutrition_information: {
    allergens: string
    ingredients: string
  }
  color_variants: unknown[] | null
}
