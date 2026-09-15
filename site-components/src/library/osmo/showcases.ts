export interface GalleryItem {
  id: string
  title: string
  image: string
  href?: string
}

// osmo.supply/src/App.vue:245, original showcase projects in source order.
export const showcaseItems: GalleryItem[] = [
  {
    id: 'nick-ho',
    title: 'Nick Ho',
    image: '/assets/osmo/showcase-nick-ho.avif',
    href: 'https://nickho-motorsports.nl/',
  },
  {
    id: 'everwonder',
    title: 'EverWonder Studio',
    image: '/assets/osmo/showcase-everwonder.avif',
    href: 'https://everwonder.studio/',
  },
  {
    id: 'minal',
    title: 'Minal Studio',
    image: '/assets/osmo/showcase-minal.avif',
    href: 'https://www.minalstudio.com',
  },
]
