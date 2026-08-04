export interface IBaseClient<T> {
  fetchProducts(): AsyncIterable<T>;
}
