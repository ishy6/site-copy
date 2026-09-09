export type ProductVariant = {
  name: string
  onSale?: boolean
  image?: string
  swatchColor?: string
}

export type ProductVariantOption = {
  name: string
  values: ProductVariant[]
}

export type Product = {
  id?: string
  store: string
  name: string
  image: string
  price: string
  oldPrice?: string
  rating?: string
  reviews?: string
  discount?: string
  sourceUrl?: string
  purchaseUrl?: string
  onlineStoreUrl?: string
  description?: string
  gallery?: string[]
  variantOptions?: ProductVariantOption[]
  selectedVariant?: string
  ratingValue?: number | null
  ratingCount?: number
  reviewCount?: number
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  inStock?: boolean
  lowStockAmount?: number
  quantityAvailable?: number
  inventoryLabel?: string
  purchaseCountLast30Days?: number
  purchaseCountLabel?: string
  requiresShipping?: boolean
  shipsTo?: string[]
  priceInViewerCurrencyMinor?: number
  sizes?: string[]
  colors?: string[]
  gender?: 'Men' | 'Women' | 'Unisex'
  sellerCountryCode?: string
  categories?: string[]
}

type GathreProductCard = Product & { id: string }
type GathreProductMetadata = Pick<
  Product,
  | 'sourceUrl'
  | 'purchaseUrl'
  | 'onlineStoreUrl'
  | 'description'
  | 'gallery'
  | 'variantOptions'
  | 'selectedVariant'
  | 'ratingValue'
  | 'ratingCount'
  | 'reviewCount'
  | 'availability'
  | 'inStock'
  | 'lowStockAmount'
  | 'quantityAvailable'
  | 'inventoryLabel'
  | 'purchaseCountLast30Days'
  | 'purchaseCountLabel'
  | 'requiresShipping'
  | 'shipsTo'
  | 'priceInViewerCurrencyMinor'
>

export const gathreStore = {
  theme: '#a4805d',
  avatar: 'https://cdn.shopify.com/shop-assets/shopify_brokers/www-lets-playground-shopify-com.myshopify.com/1757701065/logo.png?format=webp&width=64',
  wordmark: 'https://cdn.shopify.com/s/files/1/0692/5295/files/logo.png?v=1613510622&width=640',
  heroVideo: 'https://cdn.shopify.com/videos/c/vp/5e2a731b454449e084a69494eed186e2/5e2a731b454449e084a69494eed186e2.SD-480p-1.0Mbps-57355787.mp4',
  heroPoster: 'https://cdn.shopify.com/shop-assets/shopify_brokers/www-lets-playground-shopify-com.myshopify.com/1757699625/thumbnail.png?format=webp',
  quickLinks: [
    { title: 'Shop all', path: '/m/gathre/collections/shop_all', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_209.jpg?v=1729717706&width=64' },
    { title: 'Mats', path: '/m/gathre/collections/260514480197', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/Gathre_Homepage_MatsSlider-09.png?v=1652994221&width=64' },
    { title: 'Play', path: '/m/gathre/collections/266768941125', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/block-playset-tulle-3-653c1666c6c10.png?v=1712956499&width=64' },
    { title: 'New!', path: '/m/gathre/collections/269101236293', image: 'https://cdn.shopify.com/s/files/1/0692/5295/collections/gathre_site_collection_heros_1_1ee3fda8-8247-4d63-aeac-167d1d68502d.png?v=1712199067&width=64' },
  ],
  collections: [
    { title: 'Bestsellers', path: '/m/gathre/collections/261484347461/bestsellers', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/trampoline11.jpg?v=1712207502&crop=region&crop_left=0&crop_top=107&crop_width=2000&crop_height=2554&width=512' },
    { title: 'New Arrivals', path: '/m/gathre/collections/268232654917/new-arrivals', image: 'https://cdn.shopify.com/shop-assets/shopify_brokers/www-lets-playground-shopify-com.myshopify.com/1757700691/Gathre_1_22_2562001.jpeg?crop=region&crop_left=0&crop_top=236&crop_width=2000&crop_height=1762&width=512' },
    { title: 'Play', path: '/m/gathre/collections/266768941125/play', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/block-playset-tulle-3-653c1666c6c10.png?v=1712956499&width=512' },
    { title: 'ALL MATS', path: '/m/gathre/collections/260514480197/all-mats', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/Gathre_Homepage_MatsSlider-09.png?v=1652994221&width=512' },
  ],
  links: {
    site: 'https://gathre.com',
    privacy: 'https://gathre.com/policies/privacy-policy',
    refund: 'https://gathre.com/policies/refund-policy',
    facebook: 'https://www.facebook.com/gathrecompany/',
    instagram: 'https://www.instagram.com/gathre/',
    support: 'https://gathre.customerdesk.io/?utm_source=shop_app#rp-customer-widget-home',
    email: 'mailto:hello@gathre.com',
    phone: 'tel:888-474-0591',
  },
  address: '2575 W 400 N, Suite 100, Lindon, Utah 84042, United States',
} as const

const gathreProductCards: GathreProductCard[] = [
  { id: '2083782361157', store: 'Gathre', name: 'Baby Changing Mat', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/IMG_2003.jpg?v=1729625881&width=384', price: 'HK$160.00', rating: '4.9', reviews: '160' },
  { id: '2082556969029', store: 'Gathre', name: 'Highchair Mat', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/lifestylemilletminimat-ec4f4678-84a2-4521-916e-0ba774d4d333.jpg?v=1712180561&width=384', price: 'HK$558.00', rating: '4.9', reviews: '103' },
  { id: '2082587902021', store: 'Gathre', name: 'Midi', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/world-map-midi-circle-lifestyle-product-listing-c3f023c4-d6f1-4267-9bc1-bc984f268363.jpg?v=1712180272&width=384', price: 'HK$717.00', rating: '4.8', reviews: '112' },
  { id: '2082558509125', store: 'Gathre', name: 'Micro+', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/beaumicro-wmodel-1.jpg?v=1751998310&width=384', price: 'HK$239.00', rating: '4.9', reviews: '62' },
  { id: '6898217484357', store: 'Gathre', name: 'Trampoline', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_209.jpg?v=1729717706&width=384', price: 'HK$1,274.00', rating: '4.6', reviews: '145' },
  { id: '2082545008709', store: 'Gathre', name: 'Tablecloth', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_309.jpg?v=1729718929&width=384', price: 'HK$1,194.00', rating: '4.9', reviews: '27' },
  { id: '2082561818693', store: 'Gathre', name: 'All Purpose Playmat', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_022.jpg?v=1729717363&width=384', price: 'HK$796.00', rating: '4.7', reviews: '31' },
  { id: '2082561982533', store: 'Gathre', name: 'Midi+', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathremat-2.jpg?v=1729626248&width=384', price: 'HK$1,115.00', rating: '4.6', reviews: '18' },
  { id: '4334145011781', store: 'Gathre', name: 'Padded Mini', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/image_6487327.jpg?v=1729627100&width=384', price: 'HK$1,592.00', rating: '5', reviews: '23' },
  { id: '6668018810949', store: 'Gathre', name: 'Play Tunnel', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_223.jpg?v=1729718040&width=384', price: 'HK$955.00', rating: '4.9', reviews: '34' },
  { id: '3937435516997', store: 'Gathre', name: 'Mini Floor Cushion', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/fw23lifestyleselects_minifloorcushions_all_93f0a075-0738-4d61-adb5-9221b0df41d6.png?v=1694487646&width=384', price: 'HK$955.00' },
  { id: '6763683381317', store: 'Gathre', name: 'Ball Pit', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_242.jpg?v=1729718344&width=384', price: 'HK$955.00', rating: '4', reviews: '35' },
  { id: '4387641655365', store: 'Gathre', name: 'Padded Micro+', image: 'https://cdn.shopify.com/s/files/1/0692/5295/products/SS23_Lifestyle-20.png?v=1765573390&width=384', price: 'HK$955.00', rating: '5', reviews: '11' },
  { id: '6823365869637', store: 'Gathre', name: 'Play Tent', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathreholiday25_278.jpg?v=1765573259&width=384', price: 'HK$1,990.00', rating: '4.2', reviews: '26' },
  { id: '6679285170245', store: 'Gathre', name: 'Small Advent Calendar', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/holidaylifestyle207-650db6c5d3ab1.jpg?v=1712181632&width=384', price: 'HK$717.00', oldPrice: 'HK$796.00', rating: '5', reviews: '7', discount: '10% off' },
  { id: '4628125941829', store: 'Gathre', name: 'Bunting', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/stonestripebunting4-119bfe83-0556-49f8-a5a8-32e351ad38b0.jpg?v=1712179062&width=384', price: 'HK$271.00', oldPrice: 'HK$319.00', rating: '5', reviews: '5', discount: '15% off' },
  { id: '6887569784901', store: 'Gathre', name: 'Balance Beam', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_251.jpg?v=1729718762&width=384', price: 'HK$796.00', rating: '5', reviews: '12' },
  { id: '6613446131781', store: 'Gathre', name: 'Tumbling Mat', image: 'https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_129.jpg?v=1729717603&width=384', price: 'HK$2,587.00', rating: '5', reviews: '6' },
]

const gathreProductMetadata: Record<string, GathreProductMetadata> = {
  "2083782361157": {
    "sourceUrl": "https://shop.app/products/2083782361157/baby-changing-mat",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fmicro&shop_id=6925295&sig=d135bfd60ae8ead94ed938c870b2461d6623fdaef8868be1a430a20459570372",
    "onlineStoreUrl": "https://gathre.com/products/micro",
    "description": "Great as a changing mat, placemat, pet mat, or even desk mat. Fits in your purse for ultimate portability. \nDetails\n\n\nPremium look + feel.\nWipeable + water-resistant.\n\nFolds compactly for easy storage and transportation.\nEthically + responsibly made. \nFree of toxins, PVC, phthalates, and lead. CPSIA compliant.\nBonded leather mats are backed with flocked suede, which contains 28% genuine leather.\nDimensions\n\n\nMeasures: 14in x 22in\nPLEASE NOTE: Block Micro is slightly larger and measures 22.75in x 15in.\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/products/camelmicro4-1.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/IMG_2003.jpg?v=1729625881",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/image1-32-web-6cb0d279-687f-49ea-be76-7f66e7b0734d.png?v=1681860481",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/ivorymicro1.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/alphabetmicro2.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/alphabetmatmicrotab.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/alphabetmatdeboss2-a8f30291-f391-4baf-9add-d1eb6afea68e.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/BelleMicrowmodel.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/BelleMicroOverhead1.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/BelleEdits6.jpg?v=1738257396",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/BelleEdits7.jpg?v=1738257396"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/milletmatsmicroholding-8a264ca9-f7bc-4b4c-bba6-d286a57462f7.jpg?v=1738257396"
          },
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/camelmicro4-1.jpg?v=1738257396"
          },
          {
            "name": "Raven",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/ravenmicro5-1.jpg?v=1738257396"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/microstonestripe-fd44fa19-7ab9-4fb4-812c-adeb7781a425.jpg?v=1738257396"
          },
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/ivorymicro1.jpg?v=1738257396"
          },
          {
            "name": "Ivory Scallop",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/blancscallopmicroholding-821fe87a-7cbf-4245-a3d5-752dabe77455.jpg?v=1738257396"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/thyme_micro546.jpg?v=1738257112"
          },
          {
            "name": "Beau",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/BeauMicrowmodel.jpg?v=1738257396"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripematmicro.jpg?v=1738257112"
          },
          {
            "name": "World Map",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/world-map-micro-holding-1-066dd006-02c0-413b-ae6a-4850b4b0dd12.jpg?v=1738257112"
          },
          {
            "name": "Fleurs",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/fleursmicro7-1.jpg?v=1738257396"
          },
          {
            "name": "Block",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/gathress2021j-001-b7dfc75f-8c42-46b1-a8ec-34c89ebb75e1-1.jpg?v=1738257396"
          },
          {
            "name": "Animal Alphabet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/animalalphabetmicro1.jpg?v=1738257396"
          },
          {
            "name": "Alphabet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/alphabetmicro2.jpg?v=1738257396"
          },
          {
            "name": "National Parks Map",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/nationalparks3-622afc32-5c17-4f7c-a42b-bacdc5f5c61a.jpg?v=1738257396"
          },
          {
            "name": "Numbers",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/number-micro-0801653c-831b-4bae-a634-4850b4ff091c.jpg?v=1738257396"
          },
          {
            "name": "USA Map",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/usa-map-micro-holding-0f1e175f-9c65-454a-823a-bb1e197ae02b-1.jpg?v=1738257396"
          },
          {
            "name": "London",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/LondonPrintEdits15.jpg?v=1751495657"
          }
        ]
      }
    ],
    "selectedVariant": "Camel",
    "ratingValue": 4.8875,
    "ratingCount": 160,
    "reviewCount": 121,
    "availability": "InStock",
    "inStock": true,
    "lowStockAmount": 1,
    "inventoryLabel": "Only 1 left",
    "purchaseCountLast30Days": 200,
    "purchaseCountLabel": "200+ bought in past month",
    "requiresShipping": true
  },
  "2082556969029": {
    "sourceUrl": "https://shop.app/products/2082556969029/highchair-mat",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fmini&shop_id=6925295&sig=9f92029bc22f3257603a707f3d4b9d888d88f13b1c6bad87f96e6b8b2e94db93",
    "onlineStoreUrl": "https://gathre.com/products/mini",
    "description": "Use as a portable tummy time surface or under the high chair for easier mealtime cleanup.  \n\nDetails\n\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n\n· Folds compactly for easy storage + transportation.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Bonded leather mats are backed with flocked suede, which contains 28% genuine leather.\nDimensions\n\n\nMeasures: 38in x 38in\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/blancscallopminiholding-2964495c-e41a-455f-a967-773720f084a6.jpg?v=1712180543",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/lifestylemilletminimat-ec4f4678-84a2-4521-916e-0ba774d4d333.jpg?v=1712180561",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/animalsmatminiholding2-7eb3bed6-5e6a-4206-b286-2c3891a9d92b.jpg?v=1712180561",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/animalsmatdebossdetail-5c6f13d4-b6d6-423d-bdea-796570fc7ca8.jpg?v=1712180561",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/animalsmatcornerdetail-0a12e2ab-6bd5-4993-8994-b086af4071dd.jpg?v=1712180561",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/alphabetmatminiholding-340fdb88-d3d3-4885-8b59-d8d0ab69b205.jpg?v=1712180561",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/alphabetmatminitab-5d6ba10c-2586-4e69-b0fc-cb482050c9c6.jpg?v=1712180561",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/garthre-mandihouse-042-108486d4-2fa4-4f02-8553-e26d048e9e07.png?v=1712180561",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/beauminioverheadhighchair-1.jpg?v=1712180543",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/beauminiwmodel-1.jpg?v=1712180543",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/beauminioverhead-1.jpg?v=1712180543"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorymatminiholding-7716034c-1c94-45b8-a2bd-a7eea6ee1b73.jpg?v=1717183368"
          },
          {
            "name": "Ivory Scallop",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/blancscallopminiholding-2964495c-e41a-455f-a967-773720f084a6.jpg?v=1712180543"
          },
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMini2.jpg?v=1717182929"
          },
          {
            "name": "Fleurs",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre20fw-523-5eb5b7b6-1bac-46d9-bc6d-e8c12fb54e05.jpg?v=1717183368"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/ministonestripe-4084af8b-8c67-428d-8afc-ecf41abb83ce.jpg?v=1717183368"
          },
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/IvoryMini12.jpg?v=1717183368"
          },
          {
            "name": "Animal Alphabet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/animalsmatminiholding2-7eb3bed6-5e6a-4206-b286-2c3891a9d92b.jpg?v=1712180561"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-11-17-230340-65650253a91e9.jpg?v=1719540957"
          },
          {
            "name": "Raven",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/Ravenmats2.jpg?v=1719540957"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/cafestripeminimat.png?v=1719540957&format=webp"
          },
          {
            "name": "Alphabet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/alphabetmatminiholding-340fdb88-d3d3-4885-8b59-d8d0ab69b205.jpg?v=1712180561"
          },
          {
            "name": "Numbers",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/numbers-12044efe-6e41-4566-949f-dcae04b1e85a.jpg?v=1719540957"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory Scallop",
    "ratingValue": 4.8835,
    "ratingCount": 103,
    "reviewCount": 74,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 100,
    "purchaseCountLabel": "100+ bought in past month",
    "requiresShipping": true
  },
  "2082587902021": {
    "sourceUrl": "https://shop.app/products/2082587902021/midi",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fmidi&shop_id=6925295&sig=59855e757b5a348fed9ffd8838c52d3ee89ac9fc3c7e768c80a8d60a2f6b1174",
    "onlineStoreUrl": "https://gathre.com/products/midi",
    "description": "Think beach towel, picnic blanket, craft mat, or even tablecloth. Ultra portable and great on the go. \nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n\n· Folds compactly for easy storage + transportation.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Bonded leather mats are backed with flocked suede, which contains 28% genuine leather.\nDimensions\n\n\nMidi Square: 53in x 53in\nMidi Circle: 53in diameter\n\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripematmidi.jpg?v=1717351543",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/world-map-midi-circle-lifestyle-product-listing-c3f023c4-d6f1-4267-9bc1-bc984f268363.jpg?v=1712180272",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/blancscallopmidicircleholding-56a9973d-cfae-4fd3-9717-103ea72b4d43.jpg?v=1712180272",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/blancscallopmidiholding2-55dec024-2c7c-4c39-8087-f6fc1e8c83e0.jpg?v=1755894525",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/blancscallopcornerdetail-4f85396b-7a59-4877-9085-1a736d81b7bd.jpg?v=1755894525",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camel-circles-086-ec15a0ae-7881-4b08-a40f-1d5c5be21e91.jpg?v=1717351446",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camel-circles-159-0cb59de0-0bef-4c0c-8928-d66b530dcad5.jpg?v=1717351446",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMidi5.jpg?v=1767727527",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camel-midi-holding-0aeb5977-996e-4ff3-b3e9-109c27537efc.jpg?v=1767727527",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camel-maxi-square-back-of-mat-677915c3-bab1-4df7-bf08-dc4a25c0a391.jpg?v=1767727527",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camel-maxi-square-deboss-5c8a7bcb-5999-4a94-bd07-e798e7a17508.jpg?v=1767727527"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Millet"
          },
          {
            "name": "Camel"
          },
          {
            "name": "Cafe Stripe"
          },
          {
            "name": "Commons"
          },
          {
            "name": "Ivory"
          },
          {
            "name": "Ivory Scallop"
          },
          {
            "name": "Thyme"
          },
          {
            "name": "World Map"
          },
          {
            "name": "Raven",
            "onSale": true
          },
          {
            "name": "Milestones",
            "onSale": true
          },
          {
            "name": "Stone Stripe"
          }
        ]
      },
      {
        "name": "Shape",
        "values": [
          {
            "name": "Circle"
          },
          {
            "name": "Square"
          }
        ]
      }
    ],
    "selectedVariant": "Cafe Stripe / Square",
    "ratingValue": 4.8304,
    "ratingCount": 112,
    "reviewCount": 97,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 75,
    "purchaseCountLabel": "75+ bought in past month",
    "requiresShipping": true
  },
  "2082558509125": {
    "sourceUrl": "https://shop.app/products/2082558509125/micro",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fmicro-plus&shop_id=6925295&sig=ffad1f7c7a4e04e2cffd6c2d73c7f3d5a0bbfbcf14cb760cb48c807f228399ff",
    "onlineStoreUrl": "https://gathre.com/products/micro-plus",
    "description": "Most used as a changing mat or pet mat. Great for little loved ones and the messes they make. \nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n\n· Folds compactly for easy storage + transportation.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Bonded leather mats are backed with flocked suede, which contains 28% genuine leather.\n· Vegan or \"double-sided\" mats are completely synthetic and contain no animal byproducts. \nDimensions\n\n\nMeasures: 16in x 30in\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorymatmicro-holding-66984900-fba4-439e-a773-d9b24cc780da.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/beaumicro-wmodel-1.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/beaumicro-overhead-1.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/beauedits4-617e2866-bf4d-41a1-b14d-efbe9557e6db.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/beauedits3-93151b06-42a2-4a4b-9030-e50be09676d4.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/bellemicro-overhead-1.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/belleedits7-c8c571cf-2619-4584-838f-afd17d6bb280.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/belleedits6-e27a41a2-313a-4662-a621-e2ec6f06a175.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/bellemicro-1.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMats10.jpg?v=1751998310",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMats12.jpg?v=1751998310"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorymatmicro-holding-66984900-fba4-439e-a773-d9b24cc780da.jpg?v=1751998310"
          },
          {
            "name": "Ivory Scallop",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/blancscallopmicroplusholding2-92ebe1c1-d7b6-4331-a79d-73eccddc0d77.jpg?v=1751998310"
          },
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/MilletMats10.jpg?v=1765905927"
          },
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMats10.jpg?v=1751998310"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-11-17-230416-65650253a9196.jpg?v=1751998347"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripematmicro_93e23b42-fd99-4b5e-9d2f-cb3a13abda7b.jpg?v=1751998310"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeMats12.jpg?v=1751998310"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory",
    "ratingValue": 4.8548,
    "ratingCount": 62,
    "reviewCount": 48,
    "availability": "InStock",
    "inStock": true,
    "lowStockAmount": 7,
    "inventoryLabel": "Only 7 left",
    "purchaseCountLast30Days": 100,
    "purchaseCountLabel": "100+ bought in past month",
    "requiresShipping": true
  },
  "6898217484357": {
    "sourceUrl": "https://shop.app/products/6898217484357/trampoline",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Ftrampoline&shop_id=6925295&sig=9cecc8e1eb26ffd9e0844d690443c794da6583315e5ae48cd69266b185046c14",
    "onlineStoreUrl": "https://gathre.com/products/trampoline",
    "description": "An indoor trampoline designed for confident, everyday movement while supporting balance, coordination, and active play for young kids—made to be used daily and loved for years.\n\nDetails\n· Encourages movement, balance, agility + play\n· Removable rod with a foam handle for jumpers who need an extra hand\n· Elastic ties, instead of springs for extra safety (and less noise!)\n· Easily wipeable, extra durable, and packed with fun*\n· Weight limit: 55 lbs.\n· Best for ages 3+.\n Easy-to-follow instructions will be included in your order. If you have any questions or misplace your instructions, please email us at hello@gathre.com. \nDimensions\nOne size\nMeasures: Diameter 36in x Height 9in\nWeight: 16 lbs\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/trampoline_site_listing_6.png?v=1725042365",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_209.jpg?v=1729717706",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/trampoline_site_listing_1.png?v=1725041727",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/trampoline_site_listing_2.png?v=1725042365",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/rolic_420.jpg?v=1725041670",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeTrampolineEdits1.jpg?v=1725041669",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeTrampolineEdits5.jpg?v=1725041670",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeTrampolineEdits2.jpg?v=1725041670",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/Image3_46be9e06-1a38-4ed4-90e7-de6dc28a3c87.jpg?v=1771444692",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/PalmTrampoline5_579d2730-2ab7-4fd3-b427-62dc1e4d6711.jpg?v=1771444692"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/trampoline_site_listing_6.png?v=1725042365&format=webp"
          },
          {
            "name": "Sunstone",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/SunstoneTrampoline5.jpg?v=1771444692"
          },
          {
            "name": "Palm",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/PalmTrampoline5_579d2730-2ab7-4fd3-b427-62dc1e4d6711.jpg?v=1771444692"
          },
          {
            "name": "Espresso",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/Gathre7.30.254680.jpg?v=1771444692"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeTrampolineEdits1.jpg?v=1725041669"
          }
        ]
      },
      {
        "name": "Edging",
        "values": [
          {
            "name": "Classic"
          },
          {
            "name": "Scallop"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory / Classic",
    "ratingValue": 4.5517,
    "ratingCount": 145,
    "reviewCount": 53,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 500,
    "purchaseCountLabel": "500+ bought in past month",
    "requiresShipping": true
  },
  "2082545008709": {
    "sourceUrl": "https://shop.app/products/2082545008709/tablecloth",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Ftablecloth&shop_id=6925295&sig=73722d1592a42931b7ba9f80f19db2231ae3acfe3cd61b16c72f8971acb580e8",
    "onlineStoreUrl": "https://gathre.com/products/tablecloth",
    "description": "Wipeable bonded leather for simple beauty and easy cleanup.\nLearn more about how to find the perfect size for your table HERE.\nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n\n· Folds compactly for easy storage + transportation.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Bonded leather mats are backed with flocked suede, which contains 28% genuine leather.\nDimensions\n6 Foot: 52in x 76in, seats 4.\n8 Foot: 52in x 96in, seats 6. \n10 Foot: 52in  x 120in, seats 8.\nThe drop on a tablecloth is typically anywhere between 8 inches and 16 inches, with a longer drop normally used for more formal occasions. For an everyday kitchen table situation, err on the side of a shorter drop, somewhere around 6-10 inches. \nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camletablecloth1.jpg?v=1715881791",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_309.jpg?v=1729718929",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/blanc-scallop-holiday.jpg?v=1683584479",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathretablecloths-063-a47cdce1-65d6-432b-81b9-6baa9a54e42e-65315d3b030bc.jpg?v=1715881791",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorytablecloth.jpg?v=1683584670",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathretablecloths-063-a47cdce1-65d6-432b-81b9-6baa9a54e42e-65315d3b030bc_be31c62f-a33f-45f5-a63d-107b863d1a76.jpg?v=1715881791",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/cameltablecloth2.jpg?v=1715881791",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathretableclothstonestripe.jpg?v=1715881791",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-fw2020-stills-198.jpg?v=1715881791",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-fw2020-stills-201.jpg?v=1715881791"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/camletablecloth1.jpg?v=1715881791"
          },
          {
            "name": "Raven",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/raventablecloth1.jpg?v=1715881791"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-fw2020-stills-198.jpg?v=1715881791"
          },
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathretablecloths-060-65315d3ae5600_5724c53a-eaab-46fe-8e2a-3e544d8f40c0.jpg?v=1715881791"
          },
          {
            "name": "Ivory Scallop",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/blancscallopmidiplusholding-c8697475-ca39-46c3-9272-37f2fdc7d92a_9e43dc04-a2aa-4338-8c8c-af526dd895d9.jpg?v=1715881791"
          },
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/millettable9-3a46be6c-0446-4ea8-b5ba-ed1f1003ad26.jpg?v=1715881791"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/thyme-tablecloth300-6565029a052ab.jpg?v=1715881791"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeEdits115_42d16de8-d14e-403c-8b20-5780e2feb351.jpg?v=1712937749"
          },
          {
            "name": "Menagerie",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/menagerietablecloth.jpg?v=1715881791"
          }
        ]
      },
      {
        "name": "Size",
        "values": [
          {
            "name": "6 Foot"
          },
          {
            "name": "8 Foot"
          },
          {
            "name": "10 Foot"
          }
        ]
      }
    ],
    "selectedVariant": "Camel / 6 Foot",
    "ratingValue": 4.9259,
    "ratingCount": 27,
    "reviewCount": 10,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 200,
    "purchaseCountLabel": "200+ bought in past month",
    "requiresShipping": true
  },
  "2082561818693": {
    "sourceUrl": "https://shop.app/products/2082561818693/all-purpose-playmat",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fmini-plus&shop_id=6925295&sig=3cd082c8f7d8eae7f225a92d6cc6d2bde8c33854fbb6e085398b02d2cb5b90f6",
    "onlineStoreUrl": "https://gathre.com/products/mini-plus",
    "description": "Hangs like art. Works like a playmat. And everything in between.\n\nDetails\n\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n\n· Folds compactly for easy storage and transportation.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Bonded leather mats are backed with flocked suede, which contains 28% genuine leather.\n· Vegan or \"double-sided\" mats are completely synthetic and contain no animal byproducts.\nDimensions\nMeasures: 36in x 46in\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/usa-map-mini-holding-61f6558d-e9a8-4c37-a660-ee012e9ed3e6.jpg?v=1691003550",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_022.jpg?v=1729717363",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathress2021j-134-fbf4c2a5-5ccc-484f-8a60-a22a7f738d48-1.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathress2021j-004-973387f6-1e15-4665-b5b3-c07fc7e264e6-1.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/miniplusholding-b3ed99ad-7215-4a4e-a06d-dfb2945e7beb.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathress2021j-254-815c7c51-6999-490b-ac29-5996cdb8c18f.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/newworldmap3-c6a18240-4ca0-407b-a10c-d8093fc0e7b0.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/world-map-mini-lifestyle-product-listing-d532bece-f278-453f-aa0d-52ddc43b0dbb.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/newworldmap2-38fd6fef-1ff1-4c8b-a4d4-f98b1d11a1ae.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/world-map-mini-holding-9bc7f083-2924-4091-abeb-88e220b31a53.jpg?v=1750960069",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/newworldmap1-fadef13b-2e4d-4f36-a4c8-6b03141879a1.jpg?v=1750960069"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "USA Map",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/usa-map-mini-holding-61f6558d-e9a8-4c37-a660-ee012e9ed3e6.jpg?v=1691003550"
          },
          {
            "name": "Boulevard",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathress2021j-134-fbf4c2a5-5ccc-484f-8a60-a22a7f738d48-1.jpg?v=1750960069"
          },
          {
            "name": "World Map",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/newworldmap3-c6a18240-4ca0-407b-a10c-d8093fc0e7b0.jpg?v=1750960069"
          },
          {
            "name": "Solar System",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-circles-060-1-bb1e2166-49a8-4929-98ff-994f79fcb42d.jpg?v=1750960069"
          }
        ]
      }
    ],
    "selectedVariant": "USA Map",
    "ratingValue": 4.7419,
    "ratingCount": 31,
    "reviewCount": 24,
    "availability": "InStock",
    "inStock": true,
    "requiresShipping": true
  },
  "2082561982533": {
    "sourceUrl": "https://shop.app/products/2082561982533/midi",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fmidi-plus&shop_id=6925295&sig=a361fde7882abc75db13fbb5f6fa9dcab27163fdbd8d3f5ee4b441ef2de79cde",
    "onlineStoreUrl": "https://gathre.com/products/midi-plus",
    "description": "Art on the wall. Mat on the ground. One product, so many uses.\nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n\n· Folds compactly for easy storage + transportation.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Bonded leather mats are backed with flocked suede, which contains 28% genuine leather.\nDimensions\nMeasures: 52in x 76in\nThe drop on a tablecloth is typically anywhere between 8 inches and 16 inches, with a longer drop normally used for more formal occasions. For an everyday kitchen table situation, err on the side of a shorter drop, somewhere around 6-10 inches. \nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathress2021j-007-e10ebc39-2dcf-4bed-9d19-25659ac22444-1.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathremat-2.jpg?v=1729626248",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathress2021j-123-2ee9c233-ad3e-4d0d-aa9c-e95c82b206d3-2.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camelmidi-9f081486-68a6-4689-941c-bff35af3fbd1.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camel-maxi-square-back-of-mat-5ee54585-7aa0-4a54-bd78-952e19bbf589.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/img-6273-web-ce4ef93f-9821-46c3-a8b8-989cc6095224.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/raven-micro-deboss-a7bfb953-7b9d-4a23-b9d2-cd70b9fd8c03.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/raven-micro-back-of-mat-814db662-f413-49eb-a98e-502fa7145abf.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre20fw-371-62b1e12a-f199-489d-93b4-533d8529ebaf.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-fw2020-stills-019-a17d05fc-485f-4863-968b-e05fa706d500.jpg?v=1699334369",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-fw2020-stills-014-00df87ce-adf5-43ba-9cc0-c2484828f066.jpg?v=1699334369"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Uptown",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathress2021j-007-e10ebc39-2dcf-4bed-9d19-25659ac22444-1.jpg?v=1699334369"
          },
          {
            "name": "World Map",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/world-map-midi-holding-05b82706-b905-42ad-9b1d-274eb04a836a.jpg?v=1683580027"
          },
          {
            "name": "National Parks",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/nationalparks2-4fad25c3-6953-49d0-90fb-81ee51c81a85.jpg?v=1683580027"
          },
          {
            "name": "Canada Map",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/midi-holding-canada-map-10548669-cf7d-4be5-a20f-c908e16a23d1.jpg?v=1683580027"
          },
          {
            "name": "USA Map",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/usa-map-midi-holding-b3007b7e-d057-417d-b949-eb92aec2bb8a.jpg?v=1683580027"
          }
        ]
      }
    ],
    "selectedVariant": "Uptown",
    "ratingValue": 4.5556,
    "ratingCount": 18,
    "reviewCount": 14,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 25,
    "purchaseCountLabel": "25+ bought in past month",
    "requiresShipping": true
  },
  "4334145011781": {
    "sourceUrl": "https://shop.app/products/4334145011781/padded-mini",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fpadded-mini&shop_id=6925295&sig=45663ba67c15112d26096fdd3a3f0ebfaada9083636679c9f311240acbe68429",
    "onlineStoreUrl": "https://gathre.com/products/padded-mini",
    "description": "Cushy memory foam covered in our signature wipeable faux leather. Ideal for infant tummy time or as a portable playmat. \nThis product is assembled to order in our US warehouse.  Please allow 5- 7 business days for this item to ship.\nDetails\n· Premium look & feel.\n\n· Wipeable and water-resistant*\n· Ethically and responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Vegan leather surface*\n· Memory Foam center.\n· The zipper on this product is placed for manufacturing purposes. Please do not unzip item unless necessary.\n *Joanna Bloom Products are primarily made with Liberty Fabric (100% Cotton Sugar Maple Canvas, printed in Liberty’s mill near Lake Como, Italy), which is not wipeable.\nMade With Liberty Fabric Details\n· Joanna Bloom is a quintessential Liberty botanical, based on an archival impression sheet dating from the 1940s. Exclusively redrawn and recoloured for Gathre, this charming meadow showcases a wonderful variety of scattered floral sprigs, featuring loosely outlined daisies, thistles, pinks, roses, and busy lizzies.\n· Made with 100% Cotton sugar maple canvas produced at Liberty’s mill near Lake Como, Italy.\nPlease note these products are covered in COTTON CANVAS, NOT vegan leather. Additionally, different care instructions are printed on the care tags.\nDimensions\nSquare Measures: 36in x 36in x 1.5in\n\nCircle Measures: W 40in x H 1.5in\nWeight: 8lbs\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nThis item only ships to the contiguous 48 States. Orders normally ship within 5-7 business days unless listed as Pre-Order.",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorypaddedmini-42cbb77d-fbf4-4e5d-a4b8-013c7eda705f-6477c9bb1aa9a.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/image_6487327.jpg?v=1729627100",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/Gathre20fw_090_078cf660-88fe-44b9-9140-575da631e34d.jpg?v=1712271324",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/paddedministonestripe-47f07f16-d6e9-4993-a1f7-f78aa63271e4-6477ccd1bcc3e.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/gathre-fw2020_stills_117_cce5c9aa-59a9-4a92-b626-155a74f5893b.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-fw2020-stills-110-a6044dc7-8d9f-4bac-999e-7dc2e34f46b3-6477ccce86d1e.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/img-4797-b9d9150c-6d78-477d-94be-8df1278da615-6477c9c3c3dfc.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/img-4809-e535ea64-5fc0-4660-996d-08975422994d-6477c9c2683e8.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/5z1a7890-1ce3d0b2-c728-4eb0-adc6-af6ea43d4aa9-6477c9c04f21e.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/gathretreeskirts_108_site_629adfba-243a-4ee0-8ce2-6eb96254c520.jpg?v=1712939392",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre20fw-287-830f8387-f82d-4739-b768-933c5c47e370-6477c9bf41489.jpg?v=1712939392"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Ivory"
          },
          {
            "name": "Millet"
          },
          {
            "name": "Camel"
          },
          {
            "name": "Thyme"
          },
          {
            "name": "Untanned",
            "onSale": true
          },
          {
            "name": "Beau"
          },
          {
            "name": "Dinosauria",
            "onSale": true
          },
          {
            "name": "Cafe Stripe"
          },
          {
            "name": "Stone Stripe"
          },
          {
            "name": "Paris",
            "onSale": true
          },
          {
            "name": "London",
            "onSale": true
          },
          {
            "name": "Mellow",
            "onSale": true
          },
          {
            "name": "Raven",
            "onSale": true
          },
          {
            "name": "Beau",
            "onSale": true
          },
          {
            "name": "Flora",
            "onSale": true
          },
          {
            "name": "Belle",
            "onSale": true
          },
          {
            "name": "Joanna Bloom",
            "onSale": true
          },
          {
            "name": "Petite Dancer",
            "onSale": true
          },
          {
            "name": "Menagerie",
            "onSale": true
          }
        ]
      },
      {
        "name": "Shape",
        "values": [
          {
            "name": "Circle"
          },
          {
            "name": "Square"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory / Square",
    "ratingValue": 5,
    "ratingCount": 23,
    "reviewCount": 3,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 50,
    "purchaseCountLabel": "50+ bought in past month",
    "requiresShipping": true
  },
  "6668018810949": {
    "sourceUrl": "https://shop.app/products/6668018810949/play-tunnel",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Ftunnel&shop_id=6925295&sig=7e4339559ecfd73a4b28ba06d48fe38be148c08d26d51819fcddd73663ae3096",
    "onlineStoreUrl": "https://gathre.com/products/tunnel",
    "description": "Whether it’s a secret hideout, obstacle course, or stuffed animal tea party venue, our collapsible, wipeable, and easy-to-store Tunnel is made for hours on end of fun and exploring.\nDetails\n· Premium look + feel\n· Wipeable + water resistant*\n· 100% PU leather*\n· Soft, sturdy construction\n· Collapses on itself\n· Has leather ties to keep it closed for compact storage\n· Ethically + responsibly made\n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\nDimensions\nOne Size\nMeasures 19.5in opening x 60in long \nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/cameltunnel10.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_223.jpg?v=1729718040",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeTunnel5.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeTunnel7.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeTunnel1.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/cameltunnel8.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/cameltunnel1.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorytunneldetail-b7d40a62-a961-49e3-b901-445dbb65963d-1.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-tissue-064-1.jpg?v=1722279073",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorytunnelwmodels3-cc40152e-2778-4f5c-a3d3-03c1947bcc2e-1.jpg?v=1722279073"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/cameltunnel10.jpg?v=1722279073"
          },
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre-tissue-064-1.jpg?v=1722279073"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeTunnel6.jpg?v=1758908007"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/thyme-tunnel130-copy-656502a17f66f.jpg?v=1722279073"
          },
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/MilletTunnel3.jpg?v=1722279073"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeTunnel5.jpg?v=1722279073"
          }
        ]
      }
    ],
    "selectedVariant": "Camel",
    "ratingValue": 4.9118,
    "ratingCount": 34,
    "reviewCount": 21,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 75,
    "purchaseCountLabel": "75+ bought in past month",
    "requiresShipping": true
  },
  "3937435516997": {
    "sourceUrl": "https://shop.app/products/3937435516997/mini-floor-cushion",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fmini-floor-cushion&shop_id=6925295&sig=25ab7a2782d38849dde93aa93fda2b3bd201d4494af77c66479737eb509c25d8",
    "onlineStoreUrl": "https://gathre.com/products/mini-floor-cushion",
    "description": "A cozy accessory for your playroom, reading nook, nursery, and more.\nThis product is assembled to order in our US warehouse.  Please allow 5- 7 business days for this item to ship.\nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Genuine leather handle.\n· Vegan leather surface. \n· Cotton poly filling.\nDimensions\nMeasures: 18in x 18in x 7in\nWeight: 2.5lbs\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nThis item only ships to the contiguous 48 States. Orders normally ship within 5-7 business days unless listed as Pre-Order.",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/milletminifloorcushionscircleholding-d164657d-5cae-41d9-bbb6-58aed557838f.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/fw23lifestyleselects_minifloorcushions_all_93f0a075-0738-4d61-adb5-9221b0df41d6.png?v=1694487646",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions97.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions99.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions90.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions94.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions100.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions104.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions92.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions93.jpg?v=1736946458",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre20fw-257-3c1c166b-3bb9-40e4-9bdb-ff900b6b6182.jpg?v=1736946458"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/milletminifloorcushionscircleholding-d164657d-5cae-41d9-bbb6-58aed557838f.jpg?v=1736946458"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeminifloorcircleholding.jpg?v=1736946458"
          },
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/IvoryMiniFloorCushion89.jpg?v=1736946458"
          },
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelMiniFloorCushions97.jpg?v=1736946458"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/thyme-mini-circle-floor-cushion255-6565027bb9675.jpg?v=1736946454"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeMiniFloorCushion100.jpg?v=1751494685"
          },
          {
            "name": "Raven",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/RavenMiniFloorCushion93.jpg?v=1736946458"
          },
          {
            "name": "Menagerie",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/menageriecushionminicircleholding-ae5f742c-9160-459d-9c63-7235e2480c61-1.jpg?v=1736946458"
          }
        ]
      },
      {
        "name": "Shape",
        "values": [
          {
            "name": "Square"
          },
          {
            "name": "Circle"
          }
        ]
      }
    ],
    "selectedVariant": "Millet / Circle",
    "ratingValue": null,
    "ratingCount": 0,
    "reviewCount": 0,
    "availability": "InStock",
    "inStock": true,
    "lowStockAmount": 1,
    "inventoryLabel": "Only 1 left",
    "requiresShipping": true
  },
  "6763683381317": {
    "sourceUrl": "https://shop.app/products/6763683381317/ball-pit",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fball-pit&shop_id=6925295&sig=ccfcc82f501f015556bbd4f2514f013f04e44319a43ddec67e2831e670e32cf9",
    "onlineStoreUrl": "https://gathre.com/products/ball-pit",
    "description": "A premium ball pit for babies, toddlers, and young kids — soft, stylish, and made for everyday play at home. Perfectly sized for indoor use and designed to spark movement, exploration, and imagination in little ones.\n The Ball Pit is designed to pair with the Padded Mini Circle to stand and stay in place.\nDetails\nBalls not included.\nPairs well with our Padded Mini Circle.\nAdult supervision recommended. Recommended for use on level, cushioned or carpeted surfaces.\nPremium look + feel.\nWipeable + water-resistant*\n100% vegan double-sided leather*\nEthically + responsibly made. \nFree of toxins, PVC, phthalates, and lead. CPSIA compliant.\nDimensions\n\n\nMeasures (open): W 41.5in x H 12.5in.\nMeasures (folded): L 15in x W 12.5in x H 7.5in.\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/camelballpit2.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_242.jpg?v=1729718344",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/millet-bll-pit14-1-651ae64b3ed62.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/millet-bll-pit19-651ae64c02e56.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/millet-bll-pit11-651ae64b587dc.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/millet-bll-pit1-651ae64beb22e.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivoryballpit35-1.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivoryballpit13-2.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivoryballpit2-1.jpg?v=1712178919",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivoryballpit5-1.jpg?v=1712178919"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/camelballpit2.jpg?v=1712178919"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripeBallPit20.jpg?v=1758908939"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeBallPit2.jpg?v=1712178919"
          },
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/ivoryballpit35-1.jpg?v=1712178919"
          },
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/millet-bll-pit14-1-651ae64b3ed62.jpg?v=1712178919"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/thyme-ball-pit805-copy-6565025e5f097.jpg?v=1712178919"
          },
          {
            "name": "London",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/London_Print_Edits115.jpg?v=1756933560"
          },
          {
            "name": "Mellow",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/MellowBallPit19.jpg?v=1755889717"
          },
          {
            "name": "Flora",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/FloraBallPit17.jpg?v=1755889717"
          }
        ]
      }
    ],
    "selectedVariant": "Camel",
    "ratingValue": 4.0286,
    "ratingCount": 35,
    "reviewCount": 9,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 75,
    "purchaseCountLabel": "75+ bought in past month",
    "requiresShipping": true
  },
  "4387641655365": {
    "sourceUrl": "https://shop.app/products/4387641655365/padded-micro",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fpadded-micro&shop_id=6925295&sig=40aa29405cc1e932e134c1fc133a4c6a0637fc70455525e847fff4c0aa8427a2",
    "onlineStoreUrl": "https://gathre.com/products/padded-micro",
    "description": "Cushy memory foam covered in our signature wipeable faux leather. Ideal for diaper duty or a safe spot to lay their head.\nThis product is assembled to order in our US warehouse.  Please allow 5- 7 business days for this item to ship.\nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\n· Vegan mats are completely synthetic and contain no animal byproducts. \n· The zipper on this product is placed for manufacturing purposes. Please do not unzip item unless necessary.\nDimensions\nMeasures: 16in x 30in x 1.5in\nWeight: 5lbs\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nThis item only ships free to the contiguous 48 States. Orders normally ship within 5-7 business days unless listed as Pre-Order.",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/milletpaddedmatmicro-wmodel-242edb8c-4521-421e-bedf-e2c307a979c0-1.jpg?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/SS23_Lifestyle-20.png?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathreholiday25_293.jpg?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/SS23_Lifestyle-21.png?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathrepaddedmicro-stonestripegpadmicplusto-4227f78a-9169-412c-b148-90ce26950724.jpg?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/BellePaddedMicro.jpg?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/BellePaddedMicroOverhead.jpg?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/belleedits4-51670b26-e904-4d79-88d2-81c3bb040f8f.jpg?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/products/BelleEdits1_f6ccaf90-9626-4cc0-a46e-89bf5e76ad43.jpg?v=1765573390",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/milletpaddedmatdeboss-e86a4135-e7ad-4b8c-9740-e4610138b196-1.jpg?v=1765573390"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorypaddedmicro-0e98b6b7-c07b-4112-8e4e-f04f5be0ab87-1.jpg?v=1765573390"
          },
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/milletpaddedmatmicro-wmodel-242edb8c-4521-421e-bedf-e2c307a979c0-1.jpg?v=1765573390"
          },
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelPaddedMicro_3.jpg?v=1765573390"
          },
          {
            "name": "Thyme",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/thyme-padded-micro545-656502837ddef.jpg?v=1765573390"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre20fw-197-ee03cb99-884f-42c1-8b37-e83f8e74bb89.jpg?v=1765573390"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripepaddedmicro.jpg?v=1765573390"
          },
          {
            "name": "Raven",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/RavenPaddedMicro_4.jpg?v=1765573390"
          },
          {
            "name": "Paris",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/Paris_Print_Edits39.jpg?v=1765573390"
          },
          {
            "name": "London",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/LondonPrintEdits28.jpg?v=1765573390"
          },
          {
            "name": "Belle",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/products/BellePaddedMicro.jpg?v=1765573390"
          },
          {
            "name": "Beau",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/beaupaddedmicrowmodel_123b03e4-b93d-4021-9d3e-e56dbf8bca6d.jpg?v=1765573390"
          },
          {
            "name": "Menagerie",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/menageriepaddedmicro-wmodel-d17c13ff-d8f9-45bd-9d0e-57cb227c3dd5-1.jpg?v=1765573390"
          }
        ]
      }
    ],
    "selectedVariant": "Millet",
    "ratingValue": 5,
    "ratingCount": 11,
    "reviewCount": 2,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 25,
    "purchaseCountLabel": "25+ bought in past month",
    "requiresShipping": true
  },
  "6823365869637": {
    "sourceUrl": "https://shop.app/products/6823365869637/play-tent",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fplay-tent&shop_id=6925295&sig=ef8e180d3ce27eacd0e78993628db8d1371da2c368399a86ce1cb94ea5d49628",
    "onlineStoreUrl": "https://gathre.com/products/play-tent",
    "description": "A bespoke little getaway made pint-sized for when they (or you) need some space. Their own reading, napping, playful haven.\nPadded Mat and Bunting not included.\nDetails\n· Premium look + feel.\n· 100% cotton canvas, wood, and plastic connectors.\n· Ethically + responsibly made. \n· Soft, sturdy construction.\n· Assembly Time: Less than 15 minutes. See HERE for assembly instructions. \n· Weight: 10.5 lbs. \n· Storage: We recommend saving the box for storage (or repurposing a Gathre dust bag, such as the Floor Cushion size).\n· Care: Hand wash or spot treat, line dry only.  \n· We recommend pairing with a Padded Mini Circle or Padded Midi Circle mat. The Padded Mini Circle will fit inside the play tent (please note there will be some gaps), while the Padded Midi Circle will extend around the exterior of the play tent\nEasy-to-follow instructions will be included in your order. If you have any questions or misplace your instructions, please email us at hello@gathre.com. \nDimensions\nOne Size\nMeasures (assembled): 45 in. wide x 56 in. tall\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/Gathre3.11.269443_1.jpg?v=1777054633"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/Gathre3.11.269443_1.jpg?v=1777054633"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/playtentcafestripe.png?v=1712181388&format=webp"
          },
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/StoneStripePlaytent7.jpg?v=1765573259"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory",
    "ratingValue": 4.1538,
    "ratingCount": 26,
    "reviewCount": 11,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 75,
    "purchaseCountLabel": "75+ bought in past month",
    "requiresShipping": true
  },
  "6679285170245": {
    "sourceUrl": "https://shop.app/products/6679285170245/small-advent-calendar",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fsale-small-advent-calendar&shop_id=6925295&sig=e43b15420f3f3b9b3384d944303b351803ce3ee7b4bbcd0daef588537751ffc6",
    "onlineStoreUrl": "https://gathre.com/products/sale-small-advent-calendar",
    "description": "Our minimalist take on a beloved tradition. Fill its pockets with gifts, candy, ornaments, and more as you countdown to Christmas. \nDetails\n· Wooden dowels + string for hanging.\n· Premium look + feel.\n· Wipeable + water-resistant.\n· Ethically + responsibly made. \n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\nDimensions\n\n\nMeasures: 20in x 33in with 4in x 4in pockets.\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 1-3 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/bordeauxsmalladvent1.jpg?v=1763140067",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/holidaylifestyle207-650db6c5d3ab1.jpg?v=1712181632",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-1-653019c6d5d60.png?v=1712181632",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-4-653019c8e5dc1.png?v=1712181632",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-5-653019cb31e86.png?v=1712181632",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-3-653019c84a528.png?v=1712181632",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/blanc-small-advent-650db67901084.jpg?v=1697657355",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-6-653019cb14328.png?v=1697657355",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-9-653019d035c93.png?v=1697657355",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-10-653019ecaf2f7.png?v=1697657355",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-8-653019cf0981d.png?v=1702577219"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Bordeaux",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/bordeauxsmalladvent1.jpg?v=1763140067"
          },
          {
            "name": "Ivory",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/advents-1-653019c6d5d60.png?v=1712181632&format=webp"
          }
        ]
      }
    ],
    "selectedVariant": "Bordeaux (on sale)",
    "ratingValue": 5,
    "ratingCount": 7,
    "reviewCount": 0,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 25,
    "purchaseCountLabel": "25+ bought in past month",
    "requiresShipping": true
  },
  "4628125941829": {
    "sourceUrl": "https://shop.app/products/4628125941829/bunting",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fbunting&shop_id=6925295&sig=c96f2a7846b23071970b9ee619dfc3bd9e2e0c364fef7143959bd5d874a7987b",
    "onlineStoreUrl": "https://gathre.com/products/bunting",
    "description": "Our vegan leather pennants for decor in a room, or to celebrate moments big and small.\nColor Ways\nStone Stripe: Stone Stripe, Camel, Blanc, Fog, Raven\nDetails\n · Premium look + feel.\n· Wipeable + water-resistant.\n· 100% vegan leather.\n· Ethically + responsibly made. \n-Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\nDimensions\n\n\nMeasures (end to end): 96.5in\nEach Triangle: 4x4in\n\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nOrders normally ship within 5-7 business days unless listed as Pre-Order.\n",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorybunting16-74f59c63-d77d-4a2c-b1a0-89ac13dd57cc.jpg?v=1683670154"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Stone Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/stonestripebunting-00a42223-7235-4f22-8f69-55bb228715ab.jpg?v=1712179062"
          },
          {
            "name": "Ivory",
            "onSale": true,
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/ivorybunting16-74f59c63-d77d-4a2c-b1a0-89ac13dd57cc.jpg?v=1683670154"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory (on sale)",
    "ratingValue": 5,
    "ratingCount": 5,
    "reviewCount": 0,
    "availability": "InStock",
    "inStock": true,
    "requiresShipping": true
  },
  "6887569784901": {
    "sourceUrl": "https://shop.app/products/6887569784901/balance-beam",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Fbalance-beam&shop_id=6925295&sig=0289b623b3b51b8bd5991edbee9c0d47134db91c71aa93ca344d645f6575fcbe",
    "onlineStoreUrl": "https://gathre.com/products/balance-beam",
    "description": "A little imagination, a little coordination, and a whole lot of well-balanced fun.\nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n· Ethically + responsibly made. \n· Soft, sturdy construction.\n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\nDimensions\nMeasures: L 71.75in x W 6in x H 2.5in\nFolded in half: L 35.5in x W 6in x H 5in\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nThis item only ships to the contiguous 48 States. Orders normally ship within 5-7 business days unless listed as Pre-Order.",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/balancebeam15.jpg?v=1715801539",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_251.jpg?v=1729718762",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelBalanceBeam10.jpg?v=1691430710",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelBalanceBeam5.jpg?v=1691430710",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelBalanceBeam1.jpg?v=1691430710",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/balancebeam_camel.png?v=1691430710",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_250.jpg?v=1729718755",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/SaffronBalanceBeam6.jpg?v=1769090245",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/SaffronBalanceBeam1.jpg?v=1769090245",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/SaffronBalanceBeam4.jpg?v=1769090245"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/MilletBalanceBeam1.jpg?v=1691256652"
          },
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelBalanceBeam10.jpg?v=1691430710"
          },
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/balancebeam15.jpg?v=1715801539"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory",
    "ratingValue": 5,
    "ratingCount": 12,
    "reviewCount": 2,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 25,
    "purchaseCountLabel": "25+ bought in past month",
    "requiresShipping": true
  },
  "6613446131781": {
    "sourceUrl": "https://shop.app/products/6613446131781/tumbling-mat",
    "purchaseUrl": "https://shop.app/accounts/rec_sf?redirect_url=https%3A%2F%2Fgathre.com%2Fproducts%2Ftumbling-mats&shop_id=6925295&sig=4f9af28912667fd8875c298ac9a7a8b515b56d03448029f11313349ee0baa3f3",
    "onlineStoreUrl": "https://gathre.com/products/tumbling-mats",
    "description": "Soft, versatile tumbling mats for kids’ play and movement—designed to support rolling, tumbling, and everyday active play at home. Accordion folds up for easy storage that tucks away when not in use.\n\nDetails\n· Premium look + feel.\n\n· Wipeable + water-resistant.\n· 100% vegan leather with a cushy, solid foam interior.\n· Ethically + responsibly made. \n· Soft, sturdy construction.\n· Free of toxins, PVC, phthalates, and lead. CPSIA compliant.\nDimensions\nMeasures: 48in x 80in x 1.5in\nEach section is 48in x 20 (in 4 sections sewn together)\nSize When Folded: 48in x 20in x 6in\nImage & Color Disclaimer\nOur web images are displayed to be as accurate as possible when it comes to color representation. However, with differences in computer monitors and screen brightness, we cannot be responsible for slight variations between what you see and what you receive. To be sure you’ll love the color — we recommend purchasing color swatches when possible.\nShipping Information\nThis item only ships to the contiguous 48 States. Orders normally ship within 5-7 business days unless listed as Pre-Order.",
    "gallery": [
      "https://cdn.shopify.com/s/files/1/0692/5295/files/IvoryTumblingMatFull_f868fa01-96d1-423e-bd78-c7feaec56a41.png?v=1712182084",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/gathre_holiday_129.jpg?v=1729717603",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelTumblingMat3.jpg?v=1683755503",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelTumblingMat14.jpg?v=1683755503",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelTumblingMat10.jpg?v=1683755503",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelTumblingMat11.jpg?v=1683755503",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/IvoryTumblingMatWholesale5.png?v=1712182084",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/IvoryTumblingMatDetail_c90790d5-5efe-471a-891c-3437d613f987.jpg?v=1712182084",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/IvoryTumblingMats_e17fe539-1582-4dfa-bdac-a29143a74433.png?v=1712182084",
      "https://cdn.shopify.com/s/files/1/0692/5295/files/TumblingMatEdits11_809fba98-55f7-4baa-a186-4926553876d6.jpg?v=1692131856"
    ],
    "variantOptions": [
      {
        "name": "Color",
        "values": [
          {
            "name": "Ivory",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/IvoryTumblingMatFull_f868fa01-96d1-423e-bd78-c7feaec56a41.png?v=1712182084&format=webp"
          },
          {
            "name": "Millet",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/TumblingMatEdits11_809fba98-55f7-4baa-a186-4926553876d6.jpg?v=1692131856"
          },
          {
            "name": "Camel",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CamelTumblingMat3.jpg?v=1683755503"
          },
          {
            "name": "Cafe Stripe",
            "image": "https://cdn.shopify.com/s/files/1/0692/5295/files/CafeStripeTumblingMat14.jpg?v=1751046109"
          }
        ]
      }
    ],
    "selectedVariant": "Ivory",
    "ratingValue": 5,
    "ratingCount": 6,
    "reviewCount": 0,
    "availability": "InStock",
    "inStock": true,
    "purchaseCountLast30Days": 25,
    "purchaseCountLabel": "25+ bought in past month",
    "requiresShipping": true
  }
}

export const gathreProducts: Product[] = gathreProductCards.map((product) => ({
  ...product,
  ...gathreProductMetadata[product.id],
}))

export const gathreBabyGallery = [
  'https://cdn.shopify.com/s/files/1/0692/5295/products/camelmicro4-1.jpg?v=1738257396&width=1500',
  'https://cdn.shopify.com/s/files/1/0692/5295/files/IMG_2003.jpg?v=1729625881&width=1500',
  'https://cdn.shopify.com/s/files/1/0692/5295/products/image1-32-web-6cb0d279-687f-49ea-be76-7f66e7b0734d.png?v=1681860481&width=1500',
  'https://cdn.shopify.com/s/files/1/0692/5295/products/alphabetmatmicrotab.jpg?v=1738257396&width=800',
  'https://cdn.shopify.com/s/files/1/0692/5295/products/alphabetmatdeboss2-a8f30291-f391-4baf-9add-d1eb6afea68e.jpg?v=1738257396&width=800',
  'https://cdn.shopify.com/s/files/1/0692/5295/products/BelleMicrowmodel.jpg?v=1738257396&width=800',
  'https://cdn.shopify.com/s/files/1/0692/5295/products/BelleMicroOverhead1.jpg?v=1738257396&width=800',
  'https://cdn.shopify.com/s/files/1/0692/5295/products/BelleEdits6.jpg?v=1738257396&width=800',
  'https://cdn.shopify.com/s/files/1/0692/5295/products/BelleEdits7.jpg?v=1738257396&width=800',
] as const

export const gathreBabyColors: ReadonlyArray<{ name: string; onSale?: boolean }> = [
  { name: 'Millet' },
  { name: 'Camel' },
  { name: 'Raven' },
  { name: 'Stone Stripe' },
  { name: 'Ivory' },
  { name: 'Ivory Scallop' },
  { name: 'Thyme' },
  { name: 'Beau' },
  { name: 'Cafe Stripe' },
  { name: 'World Map' },
  { name: 'Fleurs' },
  { name: 'Block' },
  { name: 'Animal Alphabet' },
  { name: 'Alphabet' },
  { name: 'National Parks Map', onSale: true },
  { name: 'Numbers', onSale: true },
  { name: 'USA Map', onSale: true },
  { name: 'London', onSale: true },
]

export const gathreReviews = [
  {
    product: 'Baby Changing Mat',
    image: gathreProducts[0]!.image,
    rating: 5,
    title: 'Worth it!',
    body: 'Easy to pack, no plastic, easy to clean, worth wvery penny, and i bought two of them.',
    reviewer: 'Haven',
    date: 'Aug 16, 2026',
  },
  {
    product: 'Trampoline',
    image: gathreProducts[4]!.image,
    rating: 5,
    title: 'My great grandson loves it.',
    body: 'I like the neutral color and how well made and sturdy it is. I had a question and emailed the company and they got back to me within 24 hours. Very pleased with this purchase. It is a little pricey but it is beautiful.',
    reviewer: 'Joanne',
    date: 'Jul 6, 2026',
  },
] as const

export const gathreProductReviews: ReadonlyArray<{
  variant: string
  rating: number
  body: string
  reviewer: string
  date: string
  image?: string
}> = [
  {
    variant: 'Millet',
    rating: 5,
    body: 'Worth it! Easy to pack, no plastic, easy to clean, worth wvery penny, and i bought two of them.',
    reviewer: 'Haven',
    date: 'August 16, 2026',
  },
  {
    variant: 'National Parks Map (on sale)',
    rating: 3,
    body: 'Has a weird bumps across material thative never seen on other gathre products.',
    reviewer: 'jacquelyn',
    date: 'August 10, 2026',
    image: 'https://cdn.shopify.com/b/shop-server-review-media-production/app/2519111/shop/6925295/review/019fecfc-186c-78c4-a550-8a9ddc27be07/ac60ca50a10411a836ea9f31e099393a.jpg?width=128',
  },
  {
    variant: 'Millet',
    rating: 5,
    body: 'Returning customer! Great travel changing mat!',
    reviewer: 'Ashley',
    date: 'July 28, 2026',
  },
]

export const categoryProducts: Product[] = [
  { store: 'Our Place', name: 'Ceramic Nonstick Perfect Pot 6.5 qt.', image: 'https://cdn.shopify.com/s/files/1/0024/4137/9915/files/pink-perfect-pot.jpg?v=1741708962&width=384', price: 'US$99.00', oldPrice: 'US$149.00', discount: '34% off', reviews: '8904' },
  { store: 'BruMate', name: 'Era 40oz | Lilac Dusk', image: 'https://cdn.shopify.com/s/files/1/1114/2308/files/era-40-lilac-dusk.png?v=1762278174&width=384', price: 'HK$358.00', reviews: '1343' },
  { store: 'GreenPan US', name: '5-Piece Silicone Utensil Set | Black', image: 'https://cdn.shopify.com/s/files/1/0531/1217/6808/products/CC005770-001-2.jpg?v=1766159889&width=384', price: 'US$39.99', oldPrice: 'US$59.99', discount: '33% off', reviews: '354' },
  { store: 'Brooklinen', name: 'Mulberry Silk Pillowcase', image: 'https://cdn.shopify.com/s/files/1/0951/7126/products/ivory-silk-pillowcase_silo.jpg?v=1717181292&width=384', price: 'US$69.00', reviews: '1577' },
  { store: 'Buffy.co', name: 'Wiggle Pillow', image: 'https://cdn.shopify.com/s/files/1/2462/9621/products/04_PDP_Bolster_NoCover_0145_RT.jpg?v=1770130222&width=384', price: 'US$109.00', reviews: '698' },
  { store: 'The Citizenry', name: 'Stonewashed Linen Sheet Set', image: 'https://cdn.shopify.com/s/files/1/0438/1069/products/Citizenry_AUG27_14513_d3d99a7f-bd05-4f5e-8769-b5961d36bdd6.jpg?v=1750952515&width=384', price: 'US$262.00', oldPrice: 'US$349.00', discount: '25% off', reviews: '881' },
  { store: 'Branch', name: 'Ergonomic Chair', image: 'https://cdn.shopify.com/s/files/1/0124/5662/4187/files/bb2_e358b257-fee0-4c22-9782-8e45e1d4ac1b.webp?v=1740774897&width=384', price: 'US$369.00', reviews: '6513' },
  { store: 'Thuma', name: 'Classic Headboard', image: 'https://cdn.shopify.com/s/files/1/2448/0687/products/220919_The-Headboard_Walnut_2_PDP.jpg?v=1664384103&width=384', price: 'US$645.00', reviews: '228' },
  { store: 'Stanley 1913', name: 'The Vitalize Shaker Bottle | 20 OZ', image: 'https://cdn.shopify.com/s/files/1/0375/3269/6635/files/Web_PNG_Square-TheVitalizeShaker20OZ-DarkBlossom-Front.png?v=1770052895&width=384', price: 'US$40.00', reviews: '1058' },
  { store: 'Caraway', name: 'Steamer Duo', image: 'https://cdn.shopify.com/s/files/1/0258/6273/3906/files/steamer-duo_stainless-steel_hero.jpg?v=1785881725&width=384', price: 'US$130.00', reviews: '648' },
  { store: 'Ruggable', name: 'Poppy Fields Doormat', image: 'https://cdn.shopify.com/s/files/1/1033/0751/products/poppy-fields-A-RC-DR006-DM23.jpg?v=1634325899&width=384', price: 'US$129.00', reviews: '480' },
  { store: 'Our Place', name: 'Spruce Steamer', image: 'https://cdn.shopify.com/s/files/1/0024/4137/9915/files/sprucesteamer.jpg?v=1704912440&width=384', price: 'US$29.00', oldPrice: 'US$35.00', discount: '17% off', reviews: '2495' },
]

export const menswearProducts: Product[] = [
  { store: 'KICKS CREW', name: "Air Jordan 11 'Legend Blue' 2024 CT8012-104", image: 'https://cdn.shopify.com/s/files/1/0603/3031/1875/files/main-square_aff3da54-bdf6-4c96-ba6a-3ff5d6a073db.jpg?v=1772238984&width=384', price: 'HK$3,059.00', reviews: '167' },
  { store: 'NAADAM', name: "The Original Cashmere Sweater Men's", image: 'https://cdn.shopify.com/s/files/1/0313/7821/files/The_Original_Cashmere_Crewneck_Sweater_Mens__CO_-Cement_067.jpg?v=1776101905&width=384', price: 'HK$812.00', reviews: '1670' },
  { store: 'Culture Kings US', name: "New Era Los Angeles Dodgers 'Velvet Official Team Color' 9FORTY A-Frame Snapback Blue", image: 'https://cdn.shopify.com/s/files/1/2114/6461/files/ac5146664a22d80a6e7e3004bb91d2485338f952_198358946405_default_0010.jpg?v=1785571330&width=384', price: 'US$45.00', reviews: '425' },
  { store: 'Taylor Stitch', name: 'The Apres Pant in Charcoal Sashiko', image: 'https://cdn.shopify.com/s/files/1/0070/1922/products/instock_m_q126_The_Apres_Pant-CharcoalSashiko_portrait_001.jpg?v=1770069330&width=384', price: 'US$128.00', reviews: '680' },
  { store: 'Dr. Squatch', name: 'Bar Soap 6-Pack', image: 'https://cdn.shopify.com/s/files/1/0275/7784/3817/files/6pk-Bundle-XrDf.png?v=1776989445&width=384', price: 'US$42.00', reviews: '2096' },
  { store: 'KUIU', name: 'Attack Pant | Verde', image: 'https://cdn.shopify.com/s/files/1/0558/1914/1278/products/40001-V2_FrontTQ_AttackPant_2021.png?v=1729293672&width=384', price: 'US$111.99', oldPrice: 'US$149.00', discount: '25% off', reviews: '1288' },
  { store: 'Dollar Shave Club', name: "Men's Shave Butter", image: 'https://cdn.shopify.com/s/files/1/0568/3943/8384/files/Shave_Butter_6_oz.png?v=1762197940&width=384', price: 'US$8.00', reviews: '332' },
  { store: 'Dixxon Flannel Co.', name: 'Elastic Stretch Belt', image: 'https://cdn.shopify.com/s/files/1/1008/2786/products/elastic-stretch-belt-336307.png?v=1642469482&width=384', price: 'US$29.99', reviews: '309' },
  { store: 'BRUNT Workwear', name: 'The Shevlin Full-Zip Hoodie', image: 'https://cdn.shopify.com/s/files/1/0332/2911/1429/files/ShevlinFullZipHtrGreenFront-3000x3000-2567b33_17915abc-853f-4eca-8bc3-3e5892c314d5.jpg?v=1762199285&width=384', price: 'US$69.99', reviews: '319' },
  { store: 'Kizik', name: "Men's Athens - Blackout", image: 'https://cdn.shopify.com/s/files/1/2281/1461/files/Athens_Black_Black_Profile_Outer_2048.png?v=1757868425&width=384', price: 'HK$925.00', oldPrice: 'HK$1,250.00', discount: '26% off', reviews: '3789' },
  { store: 'Ridge', name: 'Ridge Wallet - Kintsugi - Black', image: 'https://cdn.shopify.com/s/files/1/0613/6213/files/Kintsugi-Black-Wallet-THUMBNAIL.jpg?v=1743008938&width=384', price: 'US$95.00', reviews: '805' },
  { store: 'BYLT Basics', name: 'Hooded Drop-Cut Long Sleeve', image: 'https://cdn.shopify.com/s/files/1/1464/5034/files/250717_Hooded_Dc_LS_Black37180_2HiRes.jpg?v=1775583436&width=384', price: 'HK$365.00', oldPrice: 'HK$490.00', discount: '26% off', reviews: '948' },
]

export const beautyProducts: Product[] = [
  { store: 'Fenty Beauty', name: 'A$AP Rocky x Fenty Skin Lux Balm Duo and Roller Keychain', image: 'https://cdn.shopify.com/s/files/1/0341/3458/9485/files/FS_SMR26_T2PRODUCT_PDPHERO_LUXBALM-DUO_1200x1500_NSG_c3d1fae4-de68-4c13-8fc9-ad9505084203.jpg?v=1784235592&width=384', price: 'HK$320.00' },
  { store: 'Naturium', name: 'Double Cleanse Builder', image: 'https://cdn.shopify.com/s/files/1/0105/2265/6823/files/bundle_5d3604c6-b7e7-419a-a910-9155b7de90a6.webp?v=1773880656&width=384', price: 'US$23.40', oldPrice: 'US$26.00', discount: '10% off' },
  { store: 'MERIT Beauty', name: 'The Bespoke Duo', image: 'https://cdn.shopify.com/s/files/1/0412/1296/9117/files/BespokeDuo.jpg?v=1753893419&width=384', price: 'US$46.00', oldPrice: 'US$54.00', discount: '15% off' },
  { store: 'Oakcha', name: 'Tectonic Flora', image: 'https://cdn.shopify.com/s/files/1/0246/7666/3358/files/TECTONIC-FLORA-1.jpg?v=1787597766&width=384', price: 'HK$342.00' },
  { store: 'Beauty of Joseon', name: 'Sun-Cleanse Daily Defense Set', image: 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/5_UKOnlyBundle_2.jpg?v=1787289424&width=384', price: 'HK$282.00' },
  { store: 'Laura Geller Beauty', name: 'Baked to Go Balance-n-Glow Illuminating Foundation', image: 'https://cdn.shopify.com/s/files/1/0024/1618/1294/files/LG_Baked_to_Go_Balance_n_Glow_Illuminating_Foundation_PDP_Fenty_Porcelain.jpg?v=1755016407&width=384', price: 'HK$220.00', reviews: '411' },
  { store: 'Tarte Cosmetics', name: 'limited-edition go with the faux freckle stamp', image: 'https://cdn.shopify.com/s/files/1/0898/4972/4950/files/common__limited-edition-go-with-the-faux-freckle-stamp__01.jpg?v=1787174498&width=384', price: 'HK$200.00' },
  { store: 'Athena Club', name: 'Hair & Body Mist Trio.', image: 'https://cdn.shopify.com/s/files/1/0763/3774/2108/files/SM-PB-FB_FullSizeMistTrio_Center_aligned.webp?v=1776966743&width=384', price: 'US$45.00', oldPrice: 'US$48.00', discount: '6% off' },
  { store: 'rem beauty', name: 'treble maker 3-in-1 mascara', image: 'https://cdn.shopify.com/s/files/1/0581/3849/3094/files/01_treblemaker.png?v=1785964767&width=384', price: 'HK$190.98', reviews: '48' },
  { store: 'KITSCH', name: 'Caramel Cream Hair & Body Perfume Mist', image: 'https://cdn.shopify.com/s/files/1/0104/6904/8384/files/513317-CaramelCream-HairPerfume-Fragance-50mL-Hero-1280x1280px.jpg?v=1786043806&width=384', price: 'HK$215.00', reviews: '6' },
  { store: 'Ole Henriksen', name: 'Banana Bright+ Eye Creme Deluxe Sample', image: 'https://cdn.shopify.com/s/files/1/0615/7785/5148/products/59475primary.jpg?v=1659038875&width=384', price: 'HK$140.00', reviews: '122' },
  { store: 'Dossier Perfumes', name: 'Ambery Caramel', image: 'https://cdn.shopify.com/s/files/1/0047/4067/7699/files/AmberyCaramelCAT.jpg?v=1786531016&width=384', price: 'US$32.00', reviews: '9' },
]
