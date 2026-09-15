export interface CurrencyOption { code: string; name: string; flag: string; popular?: boolean }
export const currencyOptions: CurrencyOption[] = [
  { code: 'EUR', name: 'Euro', flag: '/assets/wise/eur.svg', popular: true },
  { code: 'USD', name: 'US dollar', flag: '/assets/wise/usd.svg', popular: true },
  { code: 'GBP', name: 'British pound', flag: '/assets/wise/gbp.svg', popular: true },
  { code: 'CAD', name: 'Canadian dollar', flag: '/assets/wise/cad.svg' },
  { code: 'HKD', name: 'Hong Kong dollar', flag: '/assets/wise/hkd.svg' },
  { code: 'INR', name: 'Indian rupee', flag: '/assets/wise/inr.svg' },
]
