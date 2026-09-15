export interface ProductPhoto { id: string; src: string; alt: string; caption?: string }

export const triGlidePhotos: ProductPhoto[] = [
  { id: 'front', src: '/assets/makr/tri-glide-front.webp', alt: 'Army Green Tri-Glide Belt, front view', caption: 'Army Green / Front' },
  { id: 'detail', src: '/assets/makr/tri-glide-detail.webp', alt: 'Army Green Tri-Glide Belt, hardware detail', caption: 'Black hardware / Detail' },
  { id: 'back', src: '/assets/makr/tri-glide-back.webp', alt: 'Army Green Tri-Glide Belt, webbing and end details', caption: 'MIL-SPEC webbing / Detail' },
]
