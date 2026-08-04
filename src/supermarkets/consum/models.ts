export interface ConsumProductList {
  totalCount: number
  totalRecipeCount: number
  hasMore: boolean
  products: ConsumProduct[]
}

export interface ConsumProduct {
  id: number
  productType: number
  code: string
  ean: string
  type: string
  productData: ConsumProductData
  media: ConsumMedia[]
  priceData: ConsumPriceData
  purchaseData: ConsumPurchaseData
  categories: ConsumCategory[]
  offers: unknown[]
  coupons: unknown[]
}

export interface ConsumBrand {
  id: string
  name: string
  url: string
  landing: boolean
}

export interface ConsumProductData {
  name: string
  brand: ConsumBrand
  url: string
  imageURL: string
  description: string
  seo: string
  seoTitle: string
  seoDescription: string
  attributeGroups: ConsumAttributeGroup[]
  attributes: ConsumAttribute[]
  format: string
  novelty: boolean
  featured: boolean
  sponsored: boolean
  actions: unknown[]
  containAllergensIntolernacies: boolean
  availability: string
  temporaryOutOfStock: boolean
}

export interface ConsumAttributeGroup {
  code: string
  name: string
  tooltip: string
  visibility: boolean
  infoProduct: boolean
  attributes: ConsumAttribute[]
}

export interface ConsumAttribute {
  code: string
  languages: ConsumLanguage[]
}

export interface ConsumLanguage {
  lang: string
  values: string[]
}

export interface ConsumMedia {
  url: string
  order: number
  type: string
}

export interface ConsumPriceData {
  prices: ConsumPrice[]
  taxPercentage: number
  priceUnitType: string
  unitPriceUnitType: string
  minimumUnit: number
  maximumUnit: number
  intervalUnit: number
}

export interface ConsumPrice {
  id: string
  toDate: string
  value: ConsumPriceValue
}

export interface ConsumPriceValue {
  centAmount: number
  centUnitAmount: number
}

export interface ConsumPurchaseData {
  allowComments: boolean
}

export interface ConsumCategory {
  id: number
  name: string
  type: number
}
