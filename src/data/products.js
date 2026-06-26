export const PRODUCTS = [
  { id: 'tui-xach-bt', name: 'Túi xách', size: 'BT', price: 860_000 },
  { id: 'hop-gong-bt', name: 'Hộp gọng', size: 'BT', price: 245_000 },
  { id: 'tui-xach-lon', name: 'Túi xách', size: 'Lớn', price: 910_000 },
  { id: 'hop-gong-lon', name: 'Hộp gọng', size: 'Lớn', price: 285_000 },
]

export const PRODUCT_NAMES = [...new Set(PRODUCTS.map((p) => p.name))]

export function getSizesForName(name) {
  return PRODUCTS.filter((p) => p.name === name).map((p) => p.size)
}

export function getProduct(name, size) {
  return PRODUCTS.find((p) => p.name === name && p.size === size)
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id)
}
