import type { NormalizedProduct, ProductPrice } from "../models";

export interface IBaseNormalizer {
  extractInternalId(raw: any): string,
  normalize(raw: any): NormalizedProduct,
  normalizePrice(raw: any): ProductPrice
}
