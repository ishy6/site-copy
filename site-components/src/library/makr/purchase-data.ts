export interface PurchaseVariant { id: string; label: string; dimensions: string; price: number; available: boolean }
export interface PurchaseSelection { variant: PurchaseVariant; quantity: number; total: number }
export const beltVariants: PurchaseVariant[] = [
  { id: '4554', label: 'Small (28-33)', dimensions: '33 in x 1.5 in', price: 112, available: true },
  { id: '4555', label: 'Medium (32-36)', dimensions: '36 in x 1.5 in', price: 112, available: true },
  { id: '4556', label: 'Large (34-38)', dimensions: '38 in x 1.5 in', price: 112, available: true },
]
