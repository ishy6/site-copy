export interface MakrFinish {
  id: string
  label: string
  color: string
  image: string
  available?: boolean
}

export interface MakrProduct {
  id: string
  title: string
  finish: string
  image: string
  price: number
  href: string
}

export const fieldPouchFinishes: MakrFinish[] = [
  { id: 'brown', label: 'Brown', color: '#715447', image: '/assets/makr/MKR_FLD_PCH_Persp_BRWN.avif' },
  { id: 'black', label: 'Black', color: '#282828', image: '/assets/makr/MKR_FLD_PCH_Persp_BLK.avif' },
  { id: 'fern', label: 'Fern', color: '#686c56', image: '/assets/makr/MKR_FLD_PCH_Persp_GRN.avif' },
]

export const makrCatalog: MakrProduct[] = fieldPouchFinishes.map((finish) => ({
  id: finish.id,
  title: 'Field Pouch',
  finish: finish.label,
  image: finish.image,
  price: 88,
  href: `https://makr.com/field-pouch-${finish.id === 'brown' ? 'brwn' : finish.id === 'black' ? 'blk' : 'fern'}`,
}))
