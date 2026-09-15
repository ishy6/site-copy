export interface RidePackage { id: string; label: string; image: string; price: number; terrain: string; tires: string; pedals: string; modes: string; available?: boolean }
export const ridePackages: RidePackage[] = [
  { id: 'road', label: 'Road', image: '/assets/also/package-road.png', price: 0, terrain: 'Paved surfaces', tires: '24 x 2.6 in ALSO On-Road', pedals: 'Standard flat', modes: 'Auto + Manual' },
  { id: 'all-terrain', label: 'All Terrain', image: '/assets/also/package-all-terrain.png', price: 200, terrain: 'Off-road trails', tires: '24 x 2.6 in ALSO x Kenda', pedals: 'Anodized aluminum off-road', modes: 'Auto + Manual + Trail' },
]
