export interface BikeCockpit { id: string; label: string; image: string; price: number; description: string; available?: boolean }
export const bikeCockpits: BikeCockpit[] = [
  { id: 'standard', label: 'Standard', image: '/assets/also/cockpit-standard.png', price: 0, description: 'Upright posture for everyday rides.' },
  { id: 'sport', label: 'Sport', image: '/assets/also/cockpit-sport.png', price: 0, description: 'Forward posture for active riding.' },
]
