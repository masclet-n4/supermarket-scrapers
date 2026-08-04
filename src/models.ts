export type JsonObject = Record<string, unknown>;

export interface NutritionReference {
  amount: number;
  unit: string;
}

export interface NutrientValue {
  value: number;
  unit: string;
}

export interface NutritionInformation {
  reference: NutritionReference;
  nutrients: Record<string, NutrientValue>;
}

export interface Supplier {
  name: string;
}

export interface NormalizedProduct {
  // Identificación
  supermarket_id: string;
  product_id: string;
  ean: string | null;

  // URLs y slug
  slug: string;
  source_url: string;

  // Datos básicos
  name: string;
  brand: string | null;
  description: string | null;
  thumbnail: string;
  photos: string[];

  // Disponibilidad y cantidad
  available: boolean;
  quantity: number;
  quantity_unit: string | null;

  // Caché del último precio conocido
  current_price: number;
  unit_price: number;
  tax_percentage: number;

  // Información extendida
  ingredients: string | null;
  allergens: string | null;
  nutrition: NutritionInformation | null;
  origin: string | null;
  legal_name: string | null;
  producer: string | null;
  suppliers: Supplier[];
}

export interface ProductPrice {
  product_id: string;
  current_price: number;
  unit_price: number;
  unit: string | null;
  tax_percentage: number;
}

export interface RawProductSnapshot {
  supermarket_id: string;
  product_id: string;
  scraped_at: string;
  payload: JsonObject;
}

export type ScrapeJobStatus =
  | "running"
  | "completed"
  | "completed_with_errors"
  | "failed";

export interface ScrapeJobError {
  product_id: string | null;
  message: string;
  stack_trace?: string;
}

export interface ScrapeJobDetails {
  products_processed: number;
  products_saved: number;
  errors_count: number;
  duration_seconds: number;
}

export interface ScrapeJob {
  id: string;
  supermarket_id?: string;
  type: `scrape:${string}`;
  status: ScrapeJobStatus;
  start_date: string;
  end_date: string | null;
  errors: ScrapeJobError[];
  details: Partial<ScrapeJobDetails>;
}

export interface SupermarketConfig {
  warehouse?: string;
  postal_code?: string;
  [key: string]: unknown;
}

export interface Supermarket {
  slug: string;
  name: string;
  enabled: boolean;
  scraper_schedule: string;
  analysis_schedule?: string;
  config?: SupermarketConfig;
}

export function generateSlug(name: string, brand = ""): string {
  return `${brand} ${name}`
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createNormalizedProduct(
  product: Omit<NormalizedProduct, "slug"> & { slug?: string },
): NormalizedProduct {
  return {
    ...product,
    slug: product.slug || generateSlug(product.name, product.brand),
  };
}
