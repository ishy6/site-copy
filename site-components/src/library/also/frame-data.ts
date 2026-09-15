export interface FrameSize { id: string; label: string; minInches: number; maxInches: number }
export interface BikeFrame { id: string; label: string; description: string; image: string; price: number; loadLbs: number; cargoLbs?: number; sizes: FrameSize[]; available?: boolean }
const standardSizes: FrameSize[] = [
  { id: 'small', label: 'Small', minInches: 59, maxInches: 68 },
  { id: 'large', label: 'Large', minInches: 65, maxInches: 80 },
]
export const bikeFrames: BikeFrame[] = [
  { id: 'solo', label: 'Solo', description: 'The Joyride', image: '/assets/also/frame-solo.png', price: 0, loadLbs: 276, sizes: standardSizes },
  { id: 'utility', label: 'Utility', description: 'The Workhorse', image: '/assets/also/frame-utility.png', price: 150, loadLbs: 300, cargoLbs: 77, sizes: standardSizes },
  { id: 'bench', label: 'Bench', description: 'The Cruiser', image: '/assets/also/frame-bench.png', price: 50, loadLbs: 276, sizes: [{ id: 'universal', label: 'Universal', minInches: 59, maxInches: 80 }] },
]

export function matchingSizes(frame: BikeFrame | undefined, heightInches: number): FrameSize[] {
  if (!Number.isFinite(heightInches)) return []
  return frame?.sizes.filter(size => heightInches >= size.minInches && heightInches <= size.maxInches) ?? []
}
