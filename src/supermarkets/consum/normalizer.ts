import type { IBaseNormalizer } from "../../base/normalizer";
import type { NormalizedProduct, ProductPrice } from "../../models";
import type { ConsumMedia, ConsumPrice, ConsumProduct, ConsumProductData } from "./models";




export class ConsumNormalizer implements IBaseNormalizer {
  constructor() {

  }

  extractInternalId(product: any): string {
    return product.id
  }

  _extractPhotos(productMedia: ConsumMedia[]): string[] {
    let photos = []
        for (const photo of productMedia) {
          photos.push(photo.url)
        }
        return photos
  }

  normalize(product: ConsumProduct): NormalizedProduct {
    return {
      "supermarket_id": "consum",
      "product_id": product.id.toString(),
      "ean": product.ean,
      "slug": product.productData.seo,
      "source_url": product.productData.url,
      "name": product.productData.name,
      "brand": product.productData.brand.name,
      "description": product.productData.description,
      "thumbnail": product.productData.imageURL,
      "photos": this._extractPhotos(product.media),
      "available": !!product.productData.availability,
      "quantity": Number(Number(product.priceData.prices[0].value.centAmount)/Number(product.priceData.prices[0].value.centUnitAmount)).toFixed(3),
      "quantity_unit": product.priceData.unitPriceUnitType.split(" ")[1] || "ud",
      "current_price": Number(product.priceData.prices[0].value.centUnitAmount),
      "unit_price": Number(product.priceData.prices[0].value.centAmount),
      "tax_percentage": Number(product.priceData.taxPercentage),
      "ingredients": product.productData.containAllergensIntolernacies ? "Contiene alergenos" : null,
      "allergens": product.productData.containAllergensIntolernacies ? "Contiene alergenos" : null,
      "nutrition": null,
      "origin": "",
      "legal_name": product.productData.name,
      "producer": null,
      "suppliers": []
    }
  }

  normalizePrice(product: ConsumProduct): ProductPrice {
    return {
      "product_id": product.id.toString(),
      "current_price": Number(product.priceData.prices[0].value.centAmount),
      "unit_price": Number(product.priceData.prices[0].value.centUnitAmount),
      "unit": product.priceData.unitPriceUnitType.split(" ")[1] || "ud",
      "tax_percentage": Number(product.priceData.taxPercentage),
    }
  }
}
