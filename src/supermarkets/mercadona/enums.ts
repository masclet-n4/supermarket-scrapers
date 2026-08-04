const baseUrl = 'https://tienda.mercadona.es/api'
export const categoriesUrl = `${baseUrl}/categories/`
export const categoryProductUrl = `${categoriesUrl}/`
export const productsUrl = `${baseUrl}/products`
const cookies = `__mo_da=${JSON.stringify({
  warehouse: 'vlc1',
  postalCode: '46460',
})}`
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0'
export const headers = {
  'Cookie': cookies,
  'User-Agent': userAgent,
}
