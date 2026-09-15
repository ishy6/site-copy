export interface TransferProvider { name: string; fee: number; rate: number; featured?: boolean }
// Static examples, supplied independently of live Wise quotes.
export const transferProviders: TransferProvider[] = [
  { name: 'Wise', fee: 6.5, rate: 1.1622, featured: true },
  { name: 'Bank transfer', fee: 18, rate: 1.141 },
  { name: 'Card transfer', fee: 24, rate: 1.128 },
]
