export interface ToolkitItem { id: string; title: string; description: string; image: string; href?: string }
export const toolkitItems: ToolkitItem[] = [
  { id: 'vault', title: 'The Vault', description: 'Our ever-growing dashboard packed with ready-to-go components.', image: '/assets/osmo/toolkit-vault.avif' },
  { id: 'course', title: 'Page Transition Course', description: 'Create page transitions that take your websites to the next level.', image: '/assets/osmo/toolkit-course.avif' },
  { id: 'buttons', title: 'Buttons', description: '100 fully accessible buttons made together with Eduard Bodak.', image: '/assets/osmo/toolkit-buttons.avif' },
]
