import type { NormalizedProduct, ProductPrice } from "../../models"
import type { MercadonaFullProduct } from "./models"



export class MercadonaNormalizer implements IBaseNormalizer {
  constructor() {

  }

  extractInternalId(product: any): string {
    return product.id
  }

  _extractPhotos(product: MercadonaFullProduct): string[] {
    let photos = []
        for (const photo in product.photos) {
          for (const type in product.photos[photo]){
            const value = product.photos[photo][type];
            if (isNaN(value)){
            photos.push(product.photos[photo][type])
            }
          }
        }
        return photos
  }

  normalize(product: MercadonaFullProduct): NormalizedProduct {
    return {
      "supermarket_id": "mercadona",
      "product_id": product.id,
      "ean": product.ean,
      "slug": product.slug,
      "source_url": product.share_url,
      "name": product.display_name,
      "brand": product.brand || product.details.brand,
      "description": product.details.description,
      "thumbnail": product.thumbnail,
      "photos": this._extractPhotos(product),
      "available": product.published,
      "quantity": Number(product.price_instructions.reference_price),
      "quantity_unit": product.price_instructions.reference_format,
      "current_price": Number(product.price_instructions.bulk_price),
      "unit_price": Number(product.price_instructions.unit_price),
      "tax_percentage": Number(product.price_instructions.tax_percentage),
      "ingredients": product.nutrition_information.ingredients,
      "allergens": product.nutrition_information.allergens,
      "nutrition": null,
      "origin": product.origin,
      "legal_name": product.details.legal_name,
      "producer": null,
      "suppliers": product.details.suppliers
    }
  }

  normalizePrice(product: MercadonaFullProduct): ProductPrice {
    return {
      "product_id": product.id,
      "current_price": Number(product.price_instructions.bulk_price),
      "unit_price": Number(product.price_instructions.unit_price),
      "unit": product.price_instructions.reference_format,
      "tax_percentage": Number(product.price_instructions.tax_percentage),
    }
  }
}
