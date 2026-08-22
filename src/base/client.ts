export type ProductErrorHandler = (error: { productId: string; error: unknown }) => void

export interface IBaseClient<T> {
  fetchProducts(onProductError?: ProductErrorHandler): AsyncIterable<T>;
}
