export const original = (path: string) =>
  /^(https?:|mailto:)/.test(path) ? path : `https://ridealso.com${path}`;

export const slides = [
  {
    image: "Homepage_Slide_1.webp",
    mobile: "Homepage_Slide_1_mobile.webp",
    title: "Gear Shop has landed.",
    action: "SHOP GEAR",
    href: "/collections/gear",
  },
  {
    image: "Homepage_Slide_2.webp",
    mobile: "Homepage_Slide_2_mobile.webp",
    title: "Move\nBeyond",
    action: "BUILD YOUR TM-B",
    href: "/products/tm-b-performance",
  },
  {
    image: "Homepage_Slide_3.webp",
    mobile: "Homepage_Slide_3_Mobile.webp",
    title: "Test Spin Near You",
    action: "BOOK A TEST SPIN",
    href: "/pages/events",
  },
];
export const promoCards = [
  {
    image: "promo-test-spin.jpg",
    title: "",
    action: "BOOK A TEST SPIN",
    href: "/pages/events",
  },
  {
    image: "promo-build.jpg",
    title: "Build your TM-B",
    action: "BUILD",
    href: "/products/tm-b-performance?view=performance",
  },
  {
    image: "promo-gear.jpg",
    title: "The Gear Shop",
    action: "EXPLORE",
    href: "/collections/gear",
  },
];
export const social = [
  ["1ff5b4f839a24034baa4a6c18badde15", "90052931"],
  ["5c2c0471884148f99a8afcf07c832b0e", "90053031"],
  ["7254dd9acbb648969348b315d582002d", "90053276"],
  ["61c12daad5aa4fd285b3cc7c60486cd2", "90053373"],
  ["be1d08ca4c4a4ac0920ce99de2e78cc2", "90053435"],
  ["5f0b134a62354f39b922733f8c4ab09d", "90053522"],
  ["4c1e73a7f99a4cab8fe82dda381f258a", "90053596"],
].map(([id, version], index) => ({
  poster: `/assets/social-${index + 1}.webp`,
  src: `https://ridealso.com/cdn/shop/videos/c/vp/${id}/${id}.HD-1080p-7.2Mbps-${version}.mp4?v=0`,
}));
export const press = [
  { quote: '"SHAPE-SHIFTING"', logo: "verge_logo.avif", name: "The Verge" },
  {
    quote: '"FUN TO RIDE AND SURPRISINGLY DIFFICULT TO STEAL"',
    logo: "washington-post.webp",
    name: "The Washington Post",
  },
  {
    quote: "\"SOLVES THE AGE-OLD 'N+1' PROBLEM\"",
    logo: "wired_logo.webp",
    name: "WIRED",
  },
  {
    quote: '"INSANE LEVELS OF MODULARITY"',
    logo: "techradar.avif",
    name: "TechRadar",
  },
  {
    quote: '"I WAS BLOWN AWAY BY THE ALMOST IMMEDIATE 0-20MPH ACCELERATION"',
    logo: "electrek_logo.webp",
    name: "Electrek",
  },
];
export const stories = [
  {
    image: "reddot.webp",
    title: "ALSO wins the Red Dot Award for Product Design 2026.",
    slug: "also-wins-the-red-dot-award-for-product-design-2026",
  },
  {
    image: "series-d.webp",
    title: "ALSO announces $150 million Series D financing",
    slug: "also-announces-150-million-series-d-financing",
  },
  {
    image: "core77.webp",
    title: "ALSO wins the Core77 Design Award 2026",
    slug: "also-wins-the-core77-design-award-2026",
  },
  {
    image: "camp-also.webp",
    title: "Camp ALSO: Ride the bike, walk the walk.",
    slug: "camp-also-ride-the-bike-walk-the-walk",
  },
  {
    image: "sea-otter.webp",
    title: "Join ALSO at the Sea Otter Classic 2026.",
    slug: "join-also-at-the-sea-otter-classic-2026",
  },
  {
    image: "doordash.png",
    title: "ALSO partners with DoorDash to accelerate autonomous delivery.",
    slug: "also-partners-with-doordash-to-accelerate-autonomous-delivery",
  },
  ...[6, 5, 4, 3].map((n) => ({
    image: `seeing-deeper-${n}.${n === 3 ? "png" : "jpg"}`,
    title: `TM-B: Seeing Deeper, Volume ${n}`,
    slug: `tm-b-seeing-deeper-volume-${n}`,
  })),
];
type MenuLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};
type MenuCard = { title: string; image: string; action: string; href: string };
export const menus: Record<string, { links: MenuLink[]; cards: MenuCard[] }> = {
  SHOP: {
    links: [
      {
        label: "E-Bike",
        children: [
          { label: "Explore", href: "/products/tm-b" },
          {
            label: "Build",
            href: "/products/tm-b-performance?view=performance",
          },
          { label: "Reserve", href: "/products/tm-b-reservation" },
        ],
      },
      { label: "Helmet", href: "/products/alpha-wave-helmet" },
      {
        label: "Top Frames",
        children: [
          { label: "Solo", href: "/products/top-frame-solo" },
          { label: "Utility", href: "/products/top-frame-utility" },
          { label: "Bench", href: "/products/top-frame-bench" },
        ],
      },
      { label: "Gear Shop", href: "/collections/gear" },
    ],
    cards: [
      {
        title: "TM-B",
        image: "nav-bike.jpg",
        action: "BUILD",
        href: "/products/tm-b-performance?view=performance",
      },
      {
        title: "Alpha Wave Helmet",
        image: "nav-helmet.jpg",
        action: "EXPLORE",
        href: "/products/alpha-wave-helmet",
      },
      {
        title: "Gear Shop",
        image: "Gear.webp",
        action: "EXPLORE",
        href: "/collections/gear",
      },
    ],
  },
  BIKE: {
    links: [
      { label: "Explore", href: "/products/tm-b" },
      { label: "Build", href: "/products/tm-b-performance?view=performance" },
      { label: "Reserve", href: "/products/tm-b-reservation" },
      { label: "Book a Test Spin", href: "/pages/events" },
      { label: "Evo Pop-Up", href: "/pages/partnerships-evo" },
    ],
    cards: [
      {
        title: "TM-B",
        image: "explore_TM-B.webp",
        action: "EXPLORE TM-B",
        href: "/products/tm-b",
      },
      {
        title: "Test Spin",
        image: "test_spin_tile.webp",
        action: "BOOK A TEST SPIN",
        href: "/pages/events",
      },
    ],
  },
  COMPANY: {
    links: [
      { label: "About Us", href: "/pages/company" },
      { label: "TM-Q", href: "/products/quad" },
      { label: "Blog", href: "/blogs/all" },
      { label: "Careers", href: "https://jobs.ashbyhq.com/Ridealso" },
      { label: "Media Inquiries", href: "mailto:media@ridealso.com" },
    ],
    cards: [
      {
        title: "Our Company",
        image: "nav-company.jpg",
        action: "EXPLORE",
        href: "/pages/company",
      },
      {
        title: "Blog",
        image: "nav-blog.jpg",
        action: "EXPLORE",
        href: "/blogs/all",
      },
    ],
  },
  SUPPORT: {
    links: [
      { label: "Customer Support", href: "/pages/support" },
      { label: "Service & Assembly", href: "/pages/service-and-assembly" },
      { label: "Returns", href: "/pages/returns" },
      { label: "Financing", href: "/pages/financing" },
    ],
    cards: [
      {
        title: "Help Center",
        image: "nav-support.jpg",
        action: "EXPLORE",
        href: "/pages/support",
      },
      {
        title: "Service & Assembly",
        image: "nav-service.jpg",
        action: "EXPLORE",
        href: "/pages/service-and-assembly",
      },
      {
        title: "Financing",
        image: "nav-financing.jpg",
        action: "EXPLORE",
        href: "/pages/financing",
      },
    ],
  },
};
