export interface ShoppingBagItem { id: string; title: string; finish: string; image: string; price: number; quantity: number; maxQuantity?: number }
export const sampleBag: ShoppingBagItem[] = [
  { id: 'field-brown', title: 'Field Pouch', finish: 'Brown', image: '/assets/makr/MKR_FLD_PCH_Persp_BRWN.avif', price: 88, quantity: 1, maxQuantity: 10 },
  { id: 'belt-medium', title: 'Tri-Glide Belt', finish: 'Army Green / Medium', image: '/assets/makr/tri-glide-front.webp', price: 112, quantity: 1, maxQuantity: 5 },
]
