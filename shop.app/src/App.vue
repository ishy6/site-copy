<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { beautyProducts, categoryProducts, gathreProductReviews, gathreProducts, gathreReviews, gathreStore, menswearProducts, type Product, type ProductVariant, type ProductVariantOption } from './catalogData'
import { categoryDetails, type CategoryEditorial, type CategoryShelf, type CategoryTopic } from './categoryDetailData'
import ShopIcon from './components/ShopIcon.vue'
import SiteFooter from './components/SiteFooter.vue'
import { brandSections, categories, heroImages, type BrandCard } from './data'
import { isLoginLocale, loginLocaleByCode, loginLocaleOptions, type LoginLocale, type LoginLocaleCopy } from './loginLocaleData'
import { localizedTermsLocales, termsForLocale } from './termsLocaleData'
import { isCapturedProductDetail, pathFromSourceUrl } from './verifiedCatalog'
import { useHeroParallax } from './useHeroParallax'

type RouteName = 'home' | 'categories' | 'category' | 'brand' | 'cart' | 'offers' | 'results' | 'login' | 'product' | 'language' | 'terms'
type FilterPanel = null | 'all' | 'category' | 'ratings' | 'gender' | 'shipping' | 'size' | 'color' | 'price' | 'sort'
type ExpandableFilter = 'category' | 'color' | 'size'
type StoreFilterPanel = null | 'all' | 'price' | 'sort'
type StorePanelView = 'overview' | 'reviews' | 'privacy' | 'refund'
type ProductPanelView = null | 'description' | 'reviews' | 'return'
type SearchHistoryEntry = {
  query: string
  searchedAt: number
}
type CartLine = {
  key: string
  product: Product
  image: string
  quantity: number
  selectedOptions: Record<string, string>
}

const DEFAULT_IMAGE_FALLBACK = '/assets/images/categories/home-1.webp'

const categoryFilterOptions = ['All categories', 'Women', 'Men', 'Beauty', 'Food & drinks', 'Baby & toddler', 'Home', 'Fitness & nutrition', 'Accessories', 'Pet supplies', 'Toys & games', 'Electronics', 'Arts & crafts', 'Luggage & bags', 'Sporting goods']
const ratingFilterOptions = [
  { value: 'All ratings', stars: 0, label: 'All ratings' },
  { value: '4 stars & up', stars: 4, label: '4 stars and up' },
  { value: '3 stars & up', stars: 3, label: '3 stars and up' },
  { value: '2 stars & up', stars: 2, label: '2 stars and up' },
  { value: '1 star & up', stars: 1, label: '1 star and up' },
]
const genderFilterOptions = ['Men', 'Women']
const sizeFilterOptions = Array.from({ length: 23 }, (_, index) => `US ${4 + index * 0.5}`)
const colorFilterOptions = [
  { name: 'Black', color: '#121212' },
  { name: 'Silver', color: '#e4e5e5' },
  { name: 'White', color: '#ffffff' },
  { name: 'Blue', color: '#356ac3' },
  { name: 'Grey', color: '#aaa9a9' },
  { name: 'Red', color: '#d42f2f' },
  { name: 'Gold', color: '#d8b63c' },
  { name: 'Green', color: '#39804e' },
  { name: 'Pink', color: '#e9a4bd' },
  { name: 'Brown', color: '#80553a' },
  { name: 'Yellow', color: '#e5c52d' },
  { name: 'Orange', color: '#df7a2b' },
  { name: 'Purple', color: '#7655b8' },
  { name: 'Beige', color: '#d9ccb8' },
  { name: 'Navy', color: '#24375d' },
]
const sortFilterOptions = ['Relevance', 'Lowest ➞ Highest Price', 'Highest ➞ Lowest Price']
const countries = [
  'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla', 'Antigua & Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Ascension Island', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia & Herzegovina', 'Botswana', 'Brazil', 'British Indian Ocean Territory', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Caribbean Netherlands', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo - Brazzaville', 'Congo - Kinshasa', 'Cook Islands', 'Costa Rica', 'Croatia', 'Curaçao', 'Cyprus', 'Czechia', 'Côte d’Ivoire', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong SAR', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao SAR', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar (Burma)', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palestinian Territories', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn Islands', 'Poland', 'Portugal', 'Qatar', 'Réunion', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 'São Tomé & Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia & South Sandwich Islands', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'St. Barthélemy', 'St. Helena', 'St. Kitts & Nevis', 'St. Lucia', 'St. Martin', 'St. Pierre & Miquelon', 'St. Vincent & Grenadines', 'Sudan', 'Suriname', 'Svalbard & Jan Mayen', 'Sweden', 'Switzerland', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad & Tobago', 'Tristan da Cunha', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks & Caicos Islands', 'Tuvalu', 'U.S. Outlying Islands', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Wallis & Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe',
]

const searchSuggestions = [
  'Wrinkle-free clothes for travel',
  'Fun, easy to learn games for pre-teens',
  'K-beauty skincare for sensitive skin',
]

const footwearRelatedSearches = [
  'running shoes for men',
  "women's casual sneakers",
  "kids' sports shoes",
  'leather dress shoes',
  'waterproof hiking boots',
  'slip-on loafers for men',
]

const relatedSearchesByIntent = {
  beauty: ['skincare for sensitive skin', 'skin tint', 'lip oil', 'mascara', 'anti-aging skincare', 'perfume and cologne'],
  home: ['ceramic cookware', 'linen bedding', 'accent chairs', 'washable area rugs', 'home fragrance', 'kitchen essentials'],
  menswear: ['cashmere sweaters for men', 'mens hoodies', 'mens casual pants', 'mens flannel shirts', 'mens sneakers', 'travel clothes for men'],
  play: ['easy games for pre-teens', 'indoor play equipment', 'kids play mats', 'balance beam for kids', 'play tents', 'ball pits'],
} as const

const loginLanguages = loginLocaleOptions.map(({ name }) => name)
const languageCodes: Record<string, string> = {
  Čeština: 'cs',
  Dansk: 'da',
  Deutsch: 'de',
  English: 'en',
  Español: 'es',
  Suomi: 'fi',
  Français: 'fr',
  हिन्दी: 'hi',
  Italiano: 'it',
  日本語: 'ja',
  Lietuvių: 'lt',
  'Norsk (bokmål)': 'nb',
  Nederlands: 'nl',
  Polski: 'pl',
  Português: 'pt',
  Română: 'ro',
  Slovenčina: 'sk-SK',
  Slovenščina: 'sl-SI',
  Svenska: 'sv',
  '简体中文': 'zh-CN',
  '繁體中文': 'zh-TW',
  한국어: 'ko',
  'Português (Brasil)': 'pt-BR',
  Magyar: 'hu',
  Türkçe: 'tr',
  ภาษาไทย: 'th',
  'Tiếng Việt': 'vi',
  'Bahasa Indonesia': 'id',
  'Bahasa Melayu': 'ms',
  Ελληνικά: 'el',
  Български: 'bg',
  Русский: 'ru',
  Українська: 'uk',
  العربية: 'ar',
  עברית: 'he',
  Hrvatski: 'hr',
}

const settingsLanguages = [
  { name: 'Čeština', locale: 'cs' },
  { name: 'Dansk', locale: 'da' },
  { name: 'Deutsch', locale: 'de' },
  { name: 'English', locale: 'en' },
  { name: 'Español', locale: 'es' },
  { name: 'Suomi', locale: 'fi' },
  { name: 'Français', locale: 'fr' },
  { name: 'Italiano', locale: 'it' },
  { name: '日本語', locale: 'ja' },
  { name: 'Lietuvių', locale: 'lt-LT' },
  { name: 'Norsk (bokmål)', locale: 'nb' },
  { name: 'Nederlands', locale: 'nl' },
  { name: 'Polski', locale: 'pl' },
  { name: 'Português', locale: 'pt-PT' },
  { name: 'Română', locale: 'ro-RO' },
  { name: 'Svenska', locale: 'sv' },
] as const

const languageSettingsCopy = {
  cs: { title: 'Jazyk', description: 'Aktualizujte jazyk, který chcete používat v aplikaci Shop.', label: 'Jazyk', update: 'Aktualizovat', htmlLang: 'cs' },
  da: { title: 'Sprog', description: 'Opdater det sprog, du vil bruge med Shop.', label: 'Sprog', update: 'Opdater', htmlLang: 'da' },
  de: { title: 'Sprache', description: 'Aktualisiere die Sprache, die du mit Shop verwenden möchtest.', label: 'Sprache', update: 'Aktualisieren', htmlLang: 'de-AT' },
  en: { title: 'Language', description: 'Update the language you want to use with Shop.', label: 'Language', update: 'Update', htmlLang: 'en' },
  es: { title: 'Idioma', description: 'Actualiza el idioma que quieres usar con Shop.', label: 'Idioma', update: 'Actualizar', htmlLang: 'es-419' },
  fi: { title: 'Kieli', description: 'Päivitä kieli, jota haluat käyttää Shopissa.', label: 'Kieli', update: 'Päivitä', htmlLang: 'fi' },
  fr: { title: 'Langue', description: 'Mettez à jour la langue que vous souhaitez utiliser avec Shop.', label: 'Langue', update: 'Mettre à jour', htmlLang: 'fr-CA' },
  it: { title: 'Lingua', description: 'Aggiorna la lingua che vuoi usare con Shop.', label: 'Lingua', update: 'Aggiorna', htmlLang: 'it-CH' },
  ja: { title: '言語', description: 'Shop で使用する言語を更新します。', label: '言語', update: '更新する', htmlLang: 'ja' },
  'lt-LT': { title: 'Kalba', description: 'Atnaujinti kalbą, kurią norite naudoti „Shop“.', label: 'Kalba', update: 'Atnaujinti', htmlLang: 'lt-LT' },
  nb: { title: 'Språk', description: 'Oppdater språket du vil bruke med Shop.', label: 'Språk', update: 'Oppdater', htmlLang: 'nb' },
  nl: { title: 'Taal', description: 'Update de taal die je met Shop wilt gebruiken.', label: 'Taal', update: 'Updaten', htmlLang: 'nl' },
  pl: { title: 'Język', description: 'Zaktualizuj język, którego chcesz używać w Shop.', label: 'Język', update: 'Uaktualnij', htmlLang: 'pl' },
  'pt-PT': { title: 'Idioma', description: 'Atualizar o idioma que pretende utilizar com a Shop.', label: 'Idioma', update: 'Atualizar', htmlLang: 'pt-PT' },
  'ro-RO': { title: 'Limbă', description: 'Actualizează limba pe care dorești să o utilizezi cu Shop.', label: 'Limbă', update: 'Actualizează', htmlLang: 'ro-RO' },
  sv: { title: 'Språk', description: 'Uppdatera språket du vill använda med Shop.', label: 'Språk', update: 'Uppdatera', htmlLang: 'sv-SE' },
} as const

type SettingsLocale = keyof typeof languageSettingsCopy

const termsLanguages = [
  { name: 'Български', locale: 'bg-BG' }, { name: 'Čeština', locale: 'cs' }, { name: 'Dansk', locale: 'da' },
  { name: 'Deutsch', locale: 'de' }, { name: 'Ελληνικά', locale: 'el' }, { name: 'English', locale: 'en' },
  { name: 'Español', locale: 'es' }, { name: 'Suomi', locale: 'fi' }, { name: 'Français', locale: 'fr' },
  { name: 'हिन्दी', locale: 'hi' }, { name: 'Hrvatski', locale: 'hr-HR' }, { name: 'Magyar', locale: 'hu' },
  { name: 'Bahasa Indonesia', locale: 'id' }, { name: 'Italiano', locale: 'it' }, { name: '日本語', locale: 'ja' },
  { name: '한국어', locale: 'ko' }, { name: 'Lietuvių', locale: 'lt-LT' }, { name: 'Bahasa Melayu', locale: 'ms' },
  { name: 'Norsk (bokmål)', locale: 'nb' }, { name: 'Nederlands', locale: 'nl' }, { name: 'Polski', locale: 'pl' },
  { name: 'Português (Brasil)', locale: 'pt-BR' }, { name: 'Português', locale: 'pt-PT' }, { name: 'Română', locale: 'ro-RO' },
  { name: 'Русский', locale: 'ru' }, { name: 'Slovenčina', locale: 'sk-SK' }, { name: 'Slovenščina', locale: 'sl-SI' },
  { name: 'Svenska', locale: 'sv' }, { name: 'ภาษาไทย', locale: 'th' }, { name: 'Türkçe', locale: 'tr' },
  { name: 'Tiếng Việt', locale: 'vi' }, { name: '简体中文', locale: 'zh-CN' }, { name: '繁體中文', locale: 'zh-TW' },
] as const

const exploreStories = [
  {
    title: 'The 5-minute face',
    description: 'Skin tints, brow gels, and glosses.',
    image: '/assets/images/categories/story-face.jpg',
  },
  {
    title: 'The curated dining table',
    description: 'Dinnerware, glasses, and flatware.',
    image: '/assets/images/categories/story-dining.jpg',
  },
  {
    title: 'Taco Tuesday favorites',
    description: 'Tortillas, slaws, and salsas.',
    image: '/assets/images/categories/story-taco.jpg',
  },
]

const browseCategories = [
  { name: 'Beauty', color: '#b74760', images: ['beauty-1.jpg?width=500&height=500&crop=center', 'beauty-2.png?width=500&height=500&format=webp'] },
  { name: 'Women', color: '#a6abb1', images: ['women-1.jpg?width=500&height=500&crop=center', 'women-2.jpg?width=500&height=500&crop=center'] },
  { name: 'Men', color: '#174291', images: ['men-1.jpg?width=500&height=500&crop=center', 'men-2.jpg?width=500&height=500&crop=center'] },
  { name: 'Home', color: '#ca681f', images: ['home-1.jpg?width=500&height=500&crop=center', 'home-2.jpg?width=500&height=500&crop=center'] },
  { name: 'Fitness & nutrition', color: '#a6bea1', images: ['fitness-1.png?width=500&height=500&crop=center&format=webp', 'fitness-2.png?width=500&height=500&crop=center&format=webp'] },
  { name: 'Baby & toddler', color: '#97aaa2', images: ['baby-toddler-1.png?width=500&height=500&crop=center&format=webp', 'baby-toddler-2.png?width=500&height=500&crop=center&format=webp'] },
  { name: 'Sporting goods', color: '#5b48a2', images: ['sporting-goods-1.png?width=500&height=500&crop=center&format=webp', 'sporting-goods-2.png?width=500&height=500&crop=center&format=webp'] },
  { name: 'Food & drinks', color: '#ad2325', images: ['food-drinks-bg-1.png?width=500&height=500&crop=center&format=webp', 'food-drinks-bg-2.png?width=500&height=500&crop=center&format=webp'] },
  { name: 'Toys & games', color: '#22683a', images: ['toys-games-1.png?width=500&height=500&crop=center&format=webp', 'toys-games-bg-2.png?width=500&height=500&crop=center&format=webp'] },
  { name: 'Pet supplies', color: '#a9827c', images: ['pet-supplies-1.png?width=500&height=500&crop=center&format=webp', 'pet-supplies-2.png?width=500&height=500&crop=center&format=webp'] },
].map((item) => ({
  ...item,
  images: item.images.map((image) => `/assets/images/categories/${image.split('?')[0]!.replace(/\.(?:jpg|png)$/, '.webp')}`),
}))

const merchants = [
  { name: 'Amberjack', rating: '4.5', reviews: '9902', logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/amberjack-shoes.myshopify.com/logo_1683812270.png?width=640', color: '#efeee9' },
  { name: 'Extra Butter', rating: '4.9', reviews: '6704', image: 'https://cdn.shopify.com/shop-assets/shopify_brokers/extrabutterny.myshopify.com/1741978054/AndersonB-BANNER-2.jpeg?width=1000', color: '#4b302b', offer: 'Extra savings' },
  { name: 'Merinos', rating: '4.4', reviews: '1.2万', image: 'https://cdn.shopify.com/s/files/1/1938/4807/products/W-Black_Black-Slip-Ang-2.jpg?v=1725708705&width=256', color: '#e7e7e5' },
  { name: 'Tassel Children Shoes', rating: '4.7', reviews: '79', image: 'https://cdn.shopify.com/s/files/1/0914/3364/files/DSC09407copy.jpg?v=1753210806&width=256', color: '#f1f1ef' },
  { name: 'Paulgreenshoes.com', rating: '4.6', reviews: '1644', logo: 'https://cdn.shopify.com/s/files/1/0045/3397/7137/files/image-removebg-preview.png?v=1761761314&width=640', color: '#f5f4f1' },
  { name: 'Bared Footwear', rating: '4.8', reviews: '5.6万', image: 'https://cdn.shopify.com/shop-assets/shopify_brokers/bared-footwear-au.myshopify.com/1788223332/Banner.jpg.jpeg?crop=region&crop_left=0&crop_top=0&crop_width=982&crop_height=684&width=1000', color: '#d5cec7' },
  { name: 'Pashion Footwear', rating: '4.6', reviews: '5240', logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/pashionfootweardev.myshopify.com/1761761852/TTLogo.png?width=640', color: '#f2eee7' },
]

const shoeSizes = {
  women: sizeFilterOptions.filter((size) => Number(size.slice(3)) >= 5 && Number(size.slice(3)) <= 12),
  men: sizeFilterOptions.filter((size) => Number(size.slice(3)) >= 7 && Number(size.slice(3)) <= 14),
  unisex: sizeFilterOptions.filter((size) => Number(size.slice(3)) >= 5 && Number(size.slice(3)) <= 15),
  extended: sizeFilterOptions.filter((size) => Number(size.slice(3)) >= 12),
}
const northAmericaDestinations = ['HK', 'US', 'CA']
const australiaDestinations = ['HK', 'AU', 'NZ', 'US']
const europeDestinations = ['HK', 'GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'US']
const asiaDestinations = ['HK', 'CN', 'JP', 'SG', 'US']
const footwearCategories = ['Sporting goods', 'Fitness & nutrition']

const resultProducts: Product[] = [
  { store: 'Natural Footgear', name: 'Lems Primal Zen Asphalt', image: 'https://cdn.shopify.com/s/files/1/0735/7693/products/LemsPrimalZenAsphaltLateral.jpg?v=1649850555&width=384', price: 'US$104.00', oldPrice: 'US$130.00', discount: '20% off', sizes: shoeSizes.unisex, colors: ['Grey'], gender: 'Unisex', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men', 'Women'] },
  { store: 'Natural Footgear', name: 'Lems Primal 3 Eclipse', image: 'https://cdn.shopify.com/s/files/1/0735/7693/files/LemsPrimal3EclipseLateral.jpg?v=1710887026&width=384', price: 'US$100.00', oldPrice: 'US$125.00', discount: '20% off', sizes: shoeSizes.unisex, colors: ['Black'], gender: 'Unisex', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men', 'Women'] },
  { store: 'Bared Footwear', name: 'Whimbrel White Leather & Gold Star Sneakers', image: 'https://cdn.shopify.com/s/files/1/0322/6841/9208/files/Whimbrel_WhiteLeather_GoldStar_220328_02_3000x3273_dd596a2a-18d0-4581-9983-c50ebc3599a1.png?v=1719796830&width=384', price: 'HK$1,829.00', reviews: '505', sizes: shoeSizes.women, colors: ['White', 'Gold'], gender: 'Women', shipsTo: australiaDestinations, sellerCountryCode: 'AU', categories: [...footwearCategories, 'Women'] },
  { store: 'BigShoes', name: 'Revive', image: 'https://cdn.shopify.com/s/files/1/1982/6381/files/download_2_5b2ef783-90e9-4c4e-ba47-1b9aa1674802.png?v=1763148427&width=384', price: 'HK$637.00', reviews: '2', sizes: shoeSizes.extended, colors: ['Black'], gender: 'Men', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men'] },
  { store: 'ALOHAS', name: 'Tb.490 Crochet Cream Leather Sneakers', image: 'https://cdn.shopify.com/s/files/1/0762/7039/files/E-COM-5-719_467f4524-ac6b-4e98-b84b-35dbac694e1e.jpg?v=1757322156&width=384', price: '€190.00', reviews: '786', sizes: shoeSizes.women, colors: ['Beige'], gender: 'Women', shipsTo: europeDestinations, sellerCountryCode: 'ES', categories: [...footwearCategories, 'Women'] },
  { store: 'Natural Footgear', name: 'Lems Primal Eco Shade', image: 'https://cdn.shopify.com/s/files/1/0735/7693/files/LemsPrimalEcoShadeLateral.jpg?v=1713819405&width=384', price: 'US$104.00', oldPrice: 'US$130.00', discount: '20% off', sizes: shoeSizes.unisex, colors: ['Green'], gender: 'Unisex', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men', 'Women'] },
  { store: 'Wolf & Shepherd', name: 'Crossover™ Victory Trainer', image: 'https://cdn.shopify.com/s/files/1/0966/8928/products/Trainer_White_Lateral.jpg?v=1697575023&width=384', price: 'HK$1,990.00', reviews: '1546', sizes: shoeSizes.men, colors: ['White'], gender: 'Men', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men'] },
  { store: 'Shoely', name: "Women's Lems Primal Zen", image: 'https://cdn.shopify.com/s/files/1/0327/3975/4123/files/mint-3qtrpair.jpg?v=1781274661&width=384', price: 'US$130.00', sizes: shoeSizes.women, colors: ['Green'], gender: 'Women', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Women'] },
  { store: 'Sole Freedom', name: 'Kourt. Unisex', image: 'https://cdn.shopify.com/s/files/1/2225/4693/files/Kourt._Black_Top_-1.png?v=1726505517&width=384', price: 'HK$1,359.00', reviews: '3', sizes: shoeSizes.unisex, colors: ['Black'], gender: 'Unisex', shipsTo: northAmericaDestinations, sellerCountryCode: 'CA', categories: [...footwearCategories, 'Men', 'Women'] },
  { store: 'Plamondon Shoes', name: 'LAGUNA SUEDE', image: 'https://cdn.shopify.com/s/files/1/0552/8502/2913/files/FullSizeRender_1521e70c-6763-4cb1-9186-d1a89907d743.jpg?v=1768584924&width=384', price: 'US$115.00', sizes: shoeSizes.women, colors: ['Brown'], gender: 'Women', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Women'] },
  { store: 'Paddle North', name: 'Lems Trail Blazer', image: 'https://cdn.shopify.com/s/files/1/1313/4587/files/kodiak1_e3e1e7c7-f158-4b5c-9da5-761e11cccf1f.jpg?v=1773926368&width=384', price: 'HK$1,155.00', sizes: shoeSizes.men, colors: ['Brown'], gender: 'Men', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men'] },
  { store: 'footworksrunning', name: 'Lems Nine2Five V2 Unisex - Black', image: 'https://cdn.shopify.com/s/files/1/0034/4912/7010/files/Nine2FiveV2_Black_10.jpg?v=1728406758&width=384', price: 'HK$1,786.00', reviews: '4', sizes: shoeSizes.unisex, colors: ['Black'], gender: 'Unisex', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men', 'Women'] },
  { store: 'Wolf & Shepherd', name: 'SupremeKnit™ Trainer', image: 'https://cdn.shopify.com/s/files/1/0966/8928/files/Grey3QWebSize_1.jpg?v=1761802264&width=384', price: 'HK$979.00', oldPrice: 'HK$1,393.00', discount: '30% off', sizes: shoeSizes.men, colors: ['Grey'], gender: 'Men', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Men'] },
  { store: 'Tootsies Rockridge', name: 'Alpargata Heritage Canvas Ash', image: 'https://cdn.shopify.com/s/files/1/0356/1477/files/10017719-S.jpg?v=1684608630&width=384', price: 'US$49.95', sizes: shoeSizes.women, colors: ['Grey'], gender: 'Women', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Women'] },
  { store: 'Ruze Shoes', name: 'Orthofeet Celina 865 Womens Black Narrow', image: 'https://cdn.shopify.com/s/files/1/0025/4823/6334/files/865_celina_black-img4_01.webp?v=1778689516&width=384', price: 'HK$442.92', oldPrice: 'HK$1,337.31', discount: '67% off', sizes: shoeSizes.women, colors: ['Black'], gender: 'Women', shipsTo: northAmericaDestinations, sellerCountryCode: 'US', categories: [...footwearCategories, 'Women'] },
  { store: 'Saguaro Barefoot Shoes', name: 'Smart II - Barefoot Shoes', image: 'https://cdn.shopify.com/s/files/1/0641/2979/4268/files/A034_2_470c4de2-cdb0-4953-9370-c604f87f14fc.jpg?v=1763949496&width=384', price: 'HK$416.00', reviews: '3103', sizes: shoeSizes.unisex, colors: ['Beige'], gender: 'Unisex', shipsTo: asiaDestinations, sellerCountryCode: 'CN', categories: [...footwearCategories, 'Men', 'Women'] },
  { store: 'relic supply corp', name: 'VESSI Men’s Soho Sneaker', image: 'https://cdn.shopify.com/s/files/1/0279/8691/9491/files/IMG_8238.jpg?v=1732042875&width=384', price: 'HK$925.12', sizes: shoeSizes.men, colors: ['White'], gender: 'Men', shipsTo: northAmericaDestinations, sellerCountryCode: 'CA', categories: [...footwearCategories, 'Men'] },
  { store: 'MONTISPORT.FR', name: 'Chaussures Running Femme ON Cloud 6', image: 'https://cdn.shopify.com/s/files/1/0917/8988/5784/files/ON-RUNNING-Cloud-6-W-STATION-1.jpg?v=1756206915&width=384', price: 'HK$1,301.00', oldPrice: 'HK$1,486.00', discount: '12% off', sizes: shoeSizes.women, colors: ['White'], gender: 'Women', shipsTo: europeDestinations, sellerCountryCode: 'FR', categories: [...footwearCategories, 'Women'] },
]

const defaultRecentlyViewedProducts: Product[] = [
  resultProducts[0]!,
  {
    id: 'aviator-nation-logo-rainbow-vintage-trucker-hat',
    store: 'Aviator Nation',
    name: 'LOGO RAINBOW VINTAGE TRUCKER HAT',
    image: 'https://cdn.shopify.com/s/files/1/1149/5724/files/VCFL_LO_R-NPNK-FR01.jpg?v=1770238053&width=384',
    price: 'HK$370.00',
    oldPrice: 'HK$462.00',
    discount: '20% off',
  },
]

const catalogSections = [
  { title: 'Top rated in home', query: 'home', products: categoryProducts },
  { title: 'Top rated in menswear', query: 'menswear', products: menswearProducts },
  { title: 'New in beauty', query: 'beauty', products: beautyProducts },
]

const allProducts = [...resultProducts, ...categoryProducts, ...menswearProducts, ...beautyProducts, ...gathreProducts, ...defaultRecentlyViewedProducts.slice(1)]
const verifiedProductByPath = new Map(
  gathreProducts
    .filter(isCapturedProductDetail)
    .map((product) => [pathFromSourceUrl(product.sourceUrl), product]),
)
function verifiedProductFor(product: unknown) {
  if (!product || typeof product !== 'object') return undefined
  const candidate = product as Partial<Product>
  if (typeof candidate.id !== 'string' || typeof candidate.sourceUrl !== 'string') return undefined
  const verified = verifiedProductByPath.get(pathFromSourceUrl(candidate.sourceUrl))
  return verified?.id === candidate.id ? verified : undefined
}
const gathreBrand = brandSections.flatMap((section) => section.brands).find((brand) => brand.name === 'Gathre')
const verifiedGathreStorePaths = new Set([
  '/m/gathre',
  ...gathreStore.quickLinks.map((link) => link.path),
  ...gathreStore.collections.map((collection) => collection.path),
])
const searchIntentProductNames: Record<string, string[]> = {
  'wrinkle-free clothes for travel': [
    "The Original Cashmere Sweater Men's",
    'The Apres Pant in Charcoal Sashiko',
    'The Shevlin Full-Zip Hoodie',
    'Hooded Drop-Cut Long Sleeve',
    'Lems Nine2Five V2 Unisex - Black',
    'Alpargata Heritage Canvas Ash',
  ],
  'fun, easy to learn games for pre-teens': ['Trampoline', 'Play Tunnel', 'Ball Pit', 'Balance Beam', 'Tumbling Mat', 'Play Tent'],
  'running shoes for men': ['Lems Primal Zen Asphalt', 'Lems Primal 3 Eclipse', 'Crossover™ Victory Trainer', 'Lems Trail Blazer', 'Lems Nine2Five V2 Unisex - Black', 'SupremeKnit™ Trainer', 'VESSI Men’s Soho Sneaker'],
  "women's casual sneakers": ['Whimbrel White Leather & Gold Star Sneakers', 'Tb.490 Crochet Cream Leather Sneakers', "Women's Lems Primal Zen", 'Orthofeet Celina 865 Womens Black Narrow', 'Chaussures Running Femme ON Cloud 6'],
  "kids' sports shoes": ['Revive', 'Smart II - Barefoot Shoes', 'Alpargata Heritage Canvas Ash'],
  'leather dress shoes': ['Whimbrel White Leather & Gold Star Sneakers', 'LAGUNA SUEDE', 'Lems Nine2Five V2 Unisex - Black'],
  'waterproof hiking boots': ['Lems Trail Blazer', 'Smart II - Barefoot Shoes', 'Lems Primal Eco Shade'],
  'slip-on loafers for men': ['Alpargata Heritage Canvas Ash', 'Kourt. Unisex', 'Lems Nine2Five V2 Unisex - Black'],
}

const currentPath = ref(window.location.pathname)
const query = ref(new URLSearchParams(window.location.search).get('query') || '')
const searchDraft = ref(query.value)
const searchOpen = ref(false)
const heroSearch = ref<HTMLButtonElement | null>(null)
const searchOrigin = ref<'hero' | 'sticky'>('hero')
const searchAnchor = ref({ top: '328px', left: 'calc(50% + 34px)' })
const hero = ref<HTMLElement | null>(null)
useHeroParallax(hero)
const historyOpen = ref(false)
const filterPanel = ref<FilterPanel>(null)
const selectedCategoryFilter = ref('All categories')
const activeQuickFilters = ref<string[]>([])
const selectedRating = ref('All ratings')
const selectedGender = ref('')
const selectedCountry = ref('')
const selectedSizes = ref<string[]>([])
const selectedColors = ref<string[]>([])
const minimumPrice = ref(0)
const maximumPrice = ref(2000)
const selectedSort = ref('Relevance')
const allExpanded = ref<Record<ExpandableFilter, boolean>>({ category: false, color: false, size: false })
const filterAnchor = ref({ left: 0, top: 0 })
const searchHistory = ref<SearchHistoryEntry[]>([])
const searchInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const searchLayer = ref<HTMLElement | null>(null)
const historyLayer = ref<HTMLElement | null>(null)
const loginLanguageLayer = ref<HTMLElement | null>(null)
const filterPopover = ref<HTMLElement | null>(null)
const storeMenuLayer = ref<HTMLElement | null>(null)
const storeFilterLayer = ref<HTMLElement | null>(null)
const productPanelLayer = ref<HTMLElement | null>(null)
const productActionsLayer = ref<HTMLElement | null>(null)
const attachedImage = ref('')
const visualSearchSeed = ref(Number(new URLSearchParams(window.location.search).get('visual')) || 0)
const email = ref('')
const emailError = ref('')
const loginComplete = ref(false)
const loginLanguageOpen = ref(false)
const loginLocale = ref<LoginLocale>(readLoginLocale())
const selectedProductVariantIndexes = ref<Record<string, number>>({ Color: 0 })
const selectedProductImage = ref('')
const productDescriptionExpanded = ref(false)
const productActionsOpen = ref(false)
const productPanelView = ref<ProductPanelView>(null)
const productReviewQuery = ref('')
const productReviewSort = ref('Most recent')
const productReviewRating = ref('All ratings')
const productReviewColor = ref('All colors')
const shareToastMessage = ref('')
const cartItems = ref<CartLine[]>(readStoredCart())
const recentlyViewedProducts = ref<Product[]>(readStoredRecentlyViewed())
const storeFollowed = ref(false)
const storeMenuOpen = ref(false)
const storePanelView = ref<StorePanelView>('overview')
const storeSearchQuery = ref('')
const storeReviewQuery = ref('')
const storeReviewSort = ref('Newest')
const storeReviewRating = ref('All ratings')
const storeOnSale = ref(false)
const storeInStock = ref(true)
const storeSort = ref('Best selling')
const storeMinimumPrice = ref(0)
const storeMaximumPrice = ref(2000)
const storeFilterPanel = ref<StoreFilterPanel>(null)
const storeFilterAnchor = ref({ left: 92, top: 96 })
const selectedLanguage = ref(readStoredLanguage())
const settingsLocale = ref<SettingsLocale>(readSettingsLocale())
const languageDraft = ref<SettingsLocale>(settingsLocale.value)
const termsLanguage = ref(readTermsLocale())
const isStickySearchVisible = ref(false)
const heroMediaFailed = ref(false)
let objectUrl = ''
let pendingImageFingerprint: Promise<number> | null = null
let overlayTrigger: HTMLElement | null = null
let filterTrigger: HTMLElement | null = null
let shareToastTimer: ReturnType<typeof setTimeout> | undefined

const route = computed<RouteName>(() => {
  if (currentPath.value.startsWith('/accounts/login')) return 'login'
  if (currentPath.value === '/shop-cash-terms') return 'terms'
  if (currentPath.value.startsWith('/products/')) return 'product'
  if (currentPath.value.startsWith('/stores/') || currentPath.value.startsWith('/m/')) return 'brand'
  if (currentPath.value.startsWith('/categories/')) return 'category'
  if (currentPath.value === '/language-settings') return 'language'
  if (currentPath.value.startsWith('/search/results')) return 'results'
  if (currentPath.value === '/categories') return 'categories'
  if (currentPath.value === '/cart') return 'cart'
  if (currentPath.value === '/offers') return 'offers'
  return 'home'
})

const navActive = computed(() => route.value === 'category' ? 'categories' : route.value === 'login' ? '' : route.value)
const loginCopy = computed(() => loginLocaleByCode[loginLocale.value])
const loginLegalParts = computed(() => splitLoginLegal(loginCopy.value))
const settingsCopy = computed(() => languageSettingsCopy[settingsLocale.value])
const effectiveTermsLocale = computed(() => localizedTermsLocales.some((locale) => locale === termsLanguage.value) ? termsLanguage.value : 'en')
const termsLanguageName = computed(() => termsLanguages.find((language) => language.locale === effectiveTermsLocale.value)?.name || 'English')
const currentTermsSections = computed(() => termsForLocale(termsLanguage.value))
const currentProduct = computed(() => {
  if (route.value !== 'product') return undefined
  const path = currentPath.value.replace(/\/$/, '') || '/'
  return verifiedProductByPath.get(path)
})
const currentBrand = computed(() => {
  if (route.value !== 'brand' || !gathreBrand) return undefined
  const path = currentPath.value.replace(/\/$/, '')
  return verifiedGathreStorePaths.has(path) ? gathreBrand : undefined
})
const isGathreStore = computed(() => currentBrand.value === gathreBrand)
const isGathreProduct = computed(() => Boolean(currentProduct.value && gathreProducts.includes(currentProduct.value)))
const isGathreBabyChangingMat = computed(() => currentProduct.value?.id === '2083782361157')
const currentProductImages = computed<readonly string[]>(() => {
  if (!currentProduct.value) return []
  return currentProduct.value.gallery?.length ? currentProduct.value.gallery : [currentProduct.value.image]
})
const currentProductVariantOptions = computed<ProductVariantOption[]>(() => {
  if (!currentProduct.value) return []
  return variantOptionsForProduct(currentProduct.value)
})
const currentProductRating = computed(() => {
  const product = currentProduct.value
  if (!product) return ''
  if (product.rating) return product.rating
  return product.ratingValue == null ? '' : product.ratingValue.toFixed(1)
})
const currentProductRatingCount = computed(() => {
  const product = currentProduct.value
  if (!product) return 0
  return product.ratingCount ?? parseReviewCount(product.reviews)
})
const currentProductReviewCount = computed(() => currentProduct.value?.reviewCount ?? currentProductRatingCount.value)
const currentProductDescription = computed(() => currentProduct.value?.description || '')
const currentProductPurchaseCountLabel = computed(() => {
  const product = currentProduct.value
  if (!product) return ''
  if (product.purchaseCountLabel) return product.purchaseCountLabel
  if (product.purchaseCountLast30Days) return `${product.purchaseCountLast30Days}+ bought in past month`
  return ''
})
const currentProductInventoryLabel = computed(() => {
  const product = currentProduct.value
  if (!product || !isGathreProduct.value) return ''
  if (product.inventoryLabel) return product.inventoryLabel
  if (product.inStock === false || product.availability === 'OutOfStock' || product.quantityAvailable === 0) return 'Out of stock'
  const lowStockAmount = product.lowStockAmount ?? (product.quantityAvailable != null && product.quantityAvailable <= 10 ? product.quantityAvailable : undefined)
  if (lowStockAmount != null) return `Only ${lowStockAmount} left`
  return product.availability === 'PreOrder' ? 'Pre-order' : ''
})
const currentProductPurchaseUrl = computed(() => currentProduct.value?.purchaseUrl || currentProduct.value?.onlineStoreUrl || '')
const currentProductShippingUrl = computed(() => {
  const url = currentProduct.value?.onlineStoreUrl
  if (!url) return ''
  const shippingUrl = new URL(url)
  shippingUrl.searchParams.set('utm_source', 'shop_app')
  return shippingUrl.toString()
})
const currentProductShareUrl = computed(() => currentProduct.value?.sourceUrl || '')
const currentProductReviewEntries = computed(() => isGathreBabyChangingMat.value ? gathreProductReviews : [])
const relatedGathreProducts = computed(() => gathreProducts
  .filter((product) => product.id !== currentProduct.value?.id)
  .slice(0, 4))
const currentBrandLinks = computed(() => {
  return {
    ...gathreStore.links,
    shipping: 'https://gathre.com/policies/shipping-policy',
    address: gathreStore.address,
  }
})
const currentCategoryDetail = computed(() => {
  if (route.value !== 'category') return undefined
  const path = currentPath.value.replace(/\/$/, '') || '/'
  return Object.values(categoryDetails).find((detail) => detail.path === path)
})
const currentCategory = computed(() => currentCategoryDetail.value?.title)
const currentCategorySlug = computed(() => currentCategoryDetail.value?.path.split('/').filter(Boolean).at(-1) || 'home')
const currentCategoryBrands = computed(() => brandSections.find((section) => section.title.toLowerCase() === currentCategory.value?.toLowerCase())?.brands || [])
const categoryTopics = computed<CategoryTopic[]>(() => currentCategoryDetail.value?.topics || [])
const categoryEditorialItems = computed<CategoryEditorial[]>(() => currentCategoryDetail.value?.editorials || [])
const categoryProductShelves = computed<CategoryShelf[]>(() => currentCategoryDetail.value?.shelves || [])
const categoryFeaturedCategories = computed(() => currentCategoryDetail.value?.featuredCategories || [])
const currentStoreCollection = computed(() => {
  if (!isGathreStore.value) return ''
  const marker = '/collections/'
  const collectionPath = currentPath.value.includes(marker) ? currentPath.value.split(marker)[1] || '' : ''
  return collectionPath.toLowerCase()
})
const storeCollectionCards = computed(() => {
  return isGathreStore.value ? gathreStore.collections : []
})
const storeProducts = computed(() => {
  let products: Product[] = isGathreStore.value ? [...gathreProducts] : []
  if (isGathreStore.value && currentStoreCollection.value) {
    products = products.filter((product) => matchesGathreCollection(product, currentStoreCollection.value))
  }
  const storeSearch = storeSearchQuery.value.trim().toLowerCase()
  if (storeSearch) products = products.filter((product) => `${product.name} ${product.store}`.toLowerCase().includes(storeSearch))
  if (storeOnSale.value) products = products.filter((product) => product.discount)
  if (isGathreStore.value && storeInStock.value) products = products.filter((product) => product.inStock === true)
  products = products.filter((product) => {
    const price = parsePrice(product.price)
    return price >= storeMinimumPrice.value && (storeMaximumPrice.value >= 2000 || price <= storeMaximumPrice.value)
  })
  if (storeSort.value === 'Newest') products.reverse()
  if (storeSort.value === 'Price: Low - High') products.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  if (storeSort.value === 'Price: High - Low') products.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
  return products.slice(0, 18)
})
const visibleStoreReviews = computed(() => {
  const reviewQuery = storeReviewQuery.value.trim().toLowerCase()
  let reviews = gathreReviews.filter((review) => {
    const matchesQuery = !reviewQuery || `${review.title} ${review.body} ${review.product} ${review.reviewer}`.toLowerCase().includes(reviewQuery)
    const matchesRating = storeReviewRating.value === 'All ratings' || review.rating === Number.parseInt(storeReviewRating.value, 10)
    return matchesQuery && matchesRating
  })
  if (storeReviewSort.value === 'Oldest') reviews = [...reviews].reverse()
  return reviews
})

const visibleProductReviews = computed(() => {
  const reviewQuery = productReviewQuery.value.trim().toLowerCase()
  let reviews = currentProductReviewEntries.value.filter((review) => {
    const matchesQuery = !reviewQuery || `${review.body} ${review.variant} ${review.reviewer}`.toLowerCase().includes(reviewQuery)
    const matchesRating = productReviewRating.value === 'All ratings' || review.rating === Number.parseInt(productReviewRating.value, 10)
    const matchesColor = productReviewColor.value === 'All colors' || review.variant === productReviewColor.value
    return matchesQuery && matchesRating && matchesColor
  })
  if (productReviewSort.value === 'Oldest') reviews = [...reviews].reverse()
  if (productReviewSort.value === 'Highest rating') reviews = [...reviews].sort((a, b) => b.rating - a.rating)
  if (productReviewSort.value === 'Lowest rating') reviews = [...reviews].sort((a, b) => a.rating - b.rating)
  return reviews
})
const productReviewColors = computed(() => [...new Set(currentProductReviewEntries.value.map((review) => review.variant))])

const searchCorpus = computed(() => {
  const normalized = query.value.toLowerCase()
  if (normalized === 'visual matches') {
    const visualCorpora = [resultProducts, categoryProducts, menswearProducts, beautyProducts, gathreProducts]
    return visualCorpora[Math.abs(visualSearchSeed.value) % visualCorpora.length]!
  }
  const intentNames = searchIntentProductNames[normalized]
  if (intentNames) return allProducts.filter((product) => intentNames.includes(product.name))
  const merchant = merchants.find((item) => item.name.toLowerCase() === normalized)
  if (merchant) {
    const merchantProducts = allProducts.filter((product) => product.store.toLowerCase() === normalized)
    return merchantProducts.length ? merchantProducts : resultProducts
  }
  if (/beauty|skin|perfume|mascara|lotion/.test(normalized)) return beautyProducts
  if (/menswear|cashmere|hoodie|flannel/.test(normalized)) return menswearProducts
  if (/\bhome\b|kitchen|bedding|chair|rug/.test(normalized)) return categoryProducts
  return resultProducts
})

const relatedSearches = computed<readonly string[]>(() => {
  const normalized = query.value.trim().toLowerCase()
  if (/beauty|skin|perfume|mascara|lotion|lip/.test(normalized)) return relatedSearchesByIntent.beauty
  if (/\bhome\b|kitchen|bedding|chair|rug|linen|cookware|fragrance/.test(normalized)) return relatedSearchesByIntent.home
  if (/menswear|cashmere|hoodie|flannel|mens\b/.test(normalized)) return relatedSearchesByIntent.menswear
  if (/baby|toddler|toy|game|play|gathre/.test(normalized)) return relatedSearchesByIntent.play
  return footwearRelatedSearches
})

const visibleResultProducts = computed(() => {
  const rawQuery = query.value.trim().toLowerCase()
  const corpusQuery = rawQuery === 'visual matches'
    || Boolean(searchIntentProductNames[rawQuery])
    || merchants.some((merchant) => merchant.name.toLowerCase() === rawQuery)
    || /beauty|skin|perfume|mascara|lotion|menswear|cashmere|hoodie|flannel|\bhome\b|kitchen|bedding|chair|rug|shoe|sneaker|footwear/.test(rawQuery)
  let products = searchCorpus.value.filter((product) => {
    const text = `${product.store} ${product.name}`.toLowerCase()
    const queryMatches = !rawQuery || corpusQuery || rawQuery.split(/\s+/).some((term) => term.length > 2 && text.includes(term))
    if (!queryMatches) return false
    if (activeQuickFilters.value.includes('On sale') && !product.discount) return false
    if (activeQuickFilters.value.includes('Sells from') && product.sellerCountryCode !== 'HK') return false
    if (activeQuickFilters.value.includes('In-stock') && product.inStock === false) return false
    if (!matchesShippingDestination(product, selectedCountry.value)) return false
    if (!matchesCategory(product, selectedCategoryFilter.value)) return false

    const reviews = parseReviewCount(product.reviews)
    const score = reviews >= 1000 ? 4.8 : reviews >= 100 ? 4.5 : reviews > 0 ? 4.2 : 0
    const minimumRating = Number.parseInt(selectedRating.value, 10)
    if (Number.isFinite(minimumRating) && score < minimumRating) return false

    const gender = inferGender(product)
    if (selectedGender.value && selectedGender.value !== gender) return false

    if (selectedSizes.value.length && !product.sizes?.some((size) => selectedSizes.value.includes(size))) return false

    const colors = product.colors?.length ? product.colors : [inferColor(product)]
    if (selectedColors.value.length && !colors.some((color) => selectedColors.value.includes(color))) return false

    const price = priceInViewerCurrencyMinor(product)
    if (price < minimumPrice.value * 100) return false
    if (maximumPrice.value < 2000 && price > maximumPrice.value * 100) return false
    return true
  })

  if (selectedSort.value === 'Lowest ➞ Highest Price') products = [...products].sort((a, b) => priceInViewerCurrencyMinor(a) - priceInViewerCurrencyMinor(b))
  if (selectedSort.value === 'Highest ➞ Lowest Price') products = [...products].sort((a, b) => priceInViewerCurrencyMinor(b) - priceInViewerCurrencyMinor(a))
  return products
})

const hasOpenDialog = computed(() => searchOpen.value || historyOpen.value || loginLanguageOpen.value || Boolean(productPanelView.value) || storeMenuOpen.value || Boolean(storeFilterPanel.value) || Boolean(filterPanel.value))
const filterDialogLabel = computed(() => ({
  all: 'Filters',
  category: 'Category',
  ratings: 'Rating',
  gender: 'Gender',
  shipping: 'Ships to',
  size: 'Size',
  color: 'Color',
  price: 'Price',
  sort: 'Sort by',
}[filterPanel.value || 'all']))
const filterPopoverStyle = computed(() => filterPanel.value && filterPanel.value !== 'all'
  ? { left: `${filterAnchor.value.left}px`, top: `${filterAnchor.value.top}px` }
  : undefined)
const hasPriceFilter = computed(() => minimumPrice.value > 0 || maximumPrice.value < 2000)
const priceRangeStyle = computed(() => ({
  '--price-start': `${minimumPrice.value / 20}%`,
  '--price-end': `${maximumPrice.value / 20}%`,
}))
const storePriceRangeStyle = computed(() => ({
  '--price-start': `${storeMinimumPrice.value / 20}%`,
  '--price-end': `${storeMaximumPrice.value / 20}%`,
}))

function parsePrice(value: string) {
  return Number.parseFloat(value.replace(/[^0-9.]/g, '')) || 0
}

function priceInViewerCurrencyMinor(product: Product) {
  if (product.priceInViewerCurrencyMinor != null) return product.priceInViewerCurrencyMinor
  const amount = parsePrice(product.price)
  const rateToHkd = product.price.startsWith('US$')
    ? 7.8
    : product.price.startsWith('€')
      ? 9.1
      : 1
  return Math.round(amount * rateToHkd * 100)
}

function parseReviewCount(value?: string) {
  if (!value) return 0
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, '')) || 0
  return value.includes('万') ? amount * 10000 : amount
}

function matchesShippingDestination(product: Product, country: string) {
  if (!country) return true
  if (!product.shipsTo?.length) return false
  const acceptedDestinations = new Set([country, shippingCode(country)].map((destination) => destination.toLowerCase()))
  return product.shipsTo.some((destination) => acceptedDestinations.has(destination.toLowerCase()))
}

function productRatingText(product: Product) {
  if (product.rating) return product.rating
  return product.ratingValue == null ? '' : product.ratingValue.toFixed(1)
}

function productRatingTotal(product: Product) {
  return product.ratingCount ?? parseReviewCount(product.reviews)
}

function variantOptionsForProduct(product: Product) {
  return product.variantOptions || []
}

function defaultVariantIndexes(product: Product | undefined) {
  if (!product) return {}
  const options = variantOptionsForProduct(product)
  const selectedNames = (product.selectedVariant || '')
    .replace(/\s*\(on sale\)$/i, '')
    .split(' / ')
  return Object.fromEntries(options.map((option, optionIndex) => {
    const selectedName = selectedNames[optionIndex] || (options.length === 1 ? selectedNames[0] : '')
    const variantIndex = option.values.findIndex((variant) => variant.name === selectedName)
    return [option.name, variantIndex >= 0 ? variantIndex : 0]
  }))
}

function selectedProductVariant(option: ProductVariantOption) {
  return option.values[selectedProductVariantIndexes.value[option.name] ?? 0]
}

function selectProductVariant(option: ProductVariantOption, variant: ProductVariant, variantIndex: number) {
  selectedProductVariantIndexes.value = {
    ...selectedProductVariantIndexes.value,
    [option.name]: variantIndex,
  }
  if (variant.image) selectedProductImage.value = variant.image
}

function matchesGathreCollection(product: Product, collectionPath: string) {
  if (!collectionPath || collectionPath === 'shop_all') return true
  if (collectionPath.startsWith('266768941125')) return /play|trampoline|tunnel|ball pit|balance beam|tumbling/i.test(product.name)
  if (collectionPath.startsWith('260514480197')) return /mat|midi|micro|tablecloth/i.test(product.name)
  const productIndex = gathreProducts.indexOf(product)
  if (collectionPath.startsWith('261484347461')) return productIndex >= 0 && productIndex < 8
  if (collectionPath.startsWith('268232654917') || collectionPath.startsWith('269101236293')) return productIndex >= 8
  return true
}

function inferGender(product: Product) {
  if (product.gender) return product.gender
  const text = `${product.store} ${product.name}`.toLowerCase()
  if (/women|woman|femme/.test(text)) return 'Women'
  if (/unisex/.test(text)) return 'Unisex'
  return 'Men'
}

function inferColor(product: Product) {
  if (product.colors?.length) return product.colors[0]!
  const text = product.name.toLowerCase()
  if (/black|asphalt|eclipse|charcoal|grey/.test(text)) return 'Black'
  if (/white|cream|ivory/.test(text)) return 'White'
  if (/blue|navy/.test(text)) return 'Blue'
  if (/pink|rose/.test(text)) return 'Pink'
  if (/green|mint|shade/.test(text)) return 'Green'
  if (/brown|tan|suede/.test(text)) return 'Brown'
  if (/red|burgundy/.test(text)) return 'Red'
  return 'Grey'
}

function matchesCategory(product: Product, category: string) {
  if (category === 'All categories') return true
  if (product.categories) return product.categories.includes(category)
  if (category === 'Beauty') return beautyProducts.includes(product)
  if (category === 'Home') return categoryProducts.includes(product)
  if (category === 'Men') return menswearProducts.includes(product) || inferGender(product) === 'Men'
  if (category === 'Women') return inferGender(product) === 'Women'
  if (category === 'Sporting goods' || category === 'Fitness & nutrition') return resultProducts.includes(product)
  return false
}

function readHistory() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('shop-search-history') || '[]')
    if (!Array.isArray(parsed)) return
    const readAt = Date.now()
    searchHistory.value = parsed.flatMap((item): SearchHistoryEntry[] => {
      if (typeof item === 'string') return [{ query: item, searchedAt: readAt }]
      if (!item || typeof item !== 'object') return []
      const candidate = item as Partial<SearchHistoryEntry>
      return typeof candidate.query === 'string' && Number.isFinite(candidate.searchedAt)
        ? [{ query: candidate.query, searchedAt: Number(candidate.searchedAt) }]
        : []
    }).slice(0, 6)
  } catch {
    searchHistory.value = []
  }
}

function formatHistoryAge(searchedAt: number) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - searchedAt) / 60_000))
  if (elapsedMinutes < 1) return 'Just now'
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours} ${elapsedHours === 1 ? 'hr' : 'hrs'} ago`
  const elapsedDays = Math.floor(elapsedHours / 24)
  return `${elapsedDays} ${elapsedDays === 1 ? 'day' : 'days'} ago`
}

function readStoredCart(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('shop-cart') || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((value): CartLine[] => {
      if (!value || typeof value !== 'object') return []
      const line = value as Partial<CartLine>
      const product = verifiedProductFor(line.product)
      if (!product || !Number.isInteger(line.quantity) || Number(line.quantity) < 1 || Number(line.quantity) > 20) return []
      if (!line.selectedOptions || typeof line.selectedOptions !== 'object' || Array.isArray(line.selectedOptions)) return []
      const storedOptions = line.selectedOptions as Record<string, unknown>
      const variantOptions = variantOptionsForProduct(product)
      if (Object.keys(storedOptions).length !== variantOptions.length) return []
      const selectedOptions: Record<string, string> = {}
      for (const option of variantOptions) {
        const selectedValue = storedOptions[option.name]
        if (typeof selectedValue !== 'string' || !option.values.some((value) => value.name === selectedValue)) return []
        selectedOptions[option.name] = selectedValue
      }
      const knownImages = new Set([
        product.image,
        ...product.gallery,
        ...variantOptions.flatMap((option) => option.values.flatMap((value) => value.image ? [value.image] : [])),
      ])
      if (typeof line.image !== 'string' || !knownImages.has(line.image)) return []
      const optionKey = Object.entries(selectedOptions).map(([name, selectedValue]) => `${name}:${selectedValue}`).join('|')
      return [{
        key: `${product.id}|${optionKey}`,
        product,
        image: line.image,
        quantity: Number(line.quantity),
        selectedOptions,
      }]
    }).slice(0, 50)
  } catch {
    return []
  }
}

function storeCart() {
  try {
    localStorage.setItem('shop-cart', JSON.stringify(cartItems.value))
  } catch {
    // The active cart still works when storage is unavailable.
  }
}

function readStoredRecentlyViewed(): Product[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('shop-recently-viewed') || '[]')
    if (Array.isArray(parsed)) {
      const products = [...new Map(parsed
        .flatMap((product) => {
          const verified = verifiedProductFor(product)
          return verified ? [[verified.id, verified] as const] : []
        })).values()].slice(0, 8)
      if (products.length) return products
    }
  } catch {
    // Fall through to the source-shaped initial recommendations.
  }
  return [...defaultRecentlyViewedProducts]
}

function productIdentity(product: Product) {
  return product.id || `${product.store}:${product.name}`
}

function rememberRecentlyViewed(product: Product) {
  recentlyViewedProducts.value = [
    product,
    ...recentlyViewedProducts.value.filter((item) => productIdentity(item) !== productIdentity(product)),
  ].slice(0, 8)
  try {
    localStorage.setItem('shop-recently-viewed', JSON.stringify(recentlyViewedProducts.value))
  } catch {
    // Recent products remain available for the current session.
  }
}

function readStoredLanguage() {
  try {
    const storedLanguage = localStorage.getItem('shop-language') || 'English'
    return loginLanguages.includes(storedLanguage) ? storedLanguage : 'English'
  } catch {
    return 'English'
  }
}

function readLoginLocale(): LoginLocale {
  const requestedLocale = new URLSearchParams(window.location.search).get('locale')
  if (isLoginLocale(requestedLocale)) return requestedLocale
  try {
    const storedLanguage = localStorage.getItem('shop-language')
    return loginLocaleOptions.find(({ name }) => name === storedLanguage)?.locale || 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

function splitLoginLegal(copy: LoginLocaleCopy) {
  const termsIndex = copy.legal.indexOf(copy.termsLabel)
  const privacyIndex = copy.legal.indexOf(copy.privacyLabel, termsIndex + copy.termsLabel.length)
  if (termsIndex < 0 || privacyIndex < 0) return { beforeTerms: copy.legal, betweenLinks: '', afterPrivacy: '' }
  return {
    beforeTerms: copy.legal.slice(0, termsIndex),
    betweenLinks: copy.legal.slice(termsIndex + copy.termsLabel.length, privacyIndex),
    afterPrivacy: copy.legal.slice(privacyIndex + copy.privacyLabel.length),
  }
}

function readSettingsLocale(): SettingsLocale {
  const locale = new URLSearchParams(window.location.search).get('locale')
  return locale && locale in languageSettingsCopy ? locale as SettingsLocale : 'en'
}

function readTermsLocale() {
  const locale = new URLSearchParams(window.location.search).get('locale') || 'en'
  return termsLanguages.some((language) => language.locale === locale) ? locale : 'en'
}

function storeHistory() {
  try {
    localStorage.setItem('shop-search-history', JSON.stringify(searchHistory.value))
  } catch {
    // Private browsing can reject local storage writes.
  }
}

function syncLocation() {
  const previousPath = currentPath.value
  const previousLoginLocale = loginLocale.value
  currentPath.value = window.location.pathname
  const locationSearch = new URLSearchParams(window.location.search)
  query.value = locationSearch.get('query') || ''
  visualSearchSeed.value = Number(locationSearch.get('visual')) || 0
  searchDraft.value = query.value
  searchOpen.value = false
  historyOpen.value = false
  loginLanguageOpen.value = false
  filterPanel.value = null
  productActionsOpen.value = false
  productPanelView.value = null
  storeMenuOpen.value = false
  storePanelView.value = 'overview'
  storeFilterPanel.value = null
  loginLocale.value = readLoginLocale()
  if (currentPath.value.startsWith('/accounts/login') && (previousPath !== currentPath.value || previousLoginLocale !== loginLocale.value)) {
    email.value = ''
    emailError.value = ''
    loginComplete.value = false
  }
  settingsLocale.value = readSettingsLocale()
  languageDraft.value = settingsLocale.value
  termsLanguage.value = readTermsLocale()
  overlayTrigger = null
  filterTrigger = null
  window.scrollTo({ top: 0 })
}

function navigate(path: string) {
  if (`${window.location.pathname}${window.location.search}` !== path) window.history.pushState({}, '', path)
  syncLocation()
}

async function openSearch(event?: MouseEvent) {
  const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  searchOrigin.value = trigger?.classList.contains('sticky-search') || route.value !== 'home' || isStickySearchVisible.value ? 'sticky' : 'hero'
  if (searchOrigin.value === 'hero' && heroSearch.value) {
    const bounds = heroSearch.value.getBoundingClientRect()
    searchAnchor.value = { top: `${bounds.top + window.scrollY}px`, left: `${bounds.left + bounds.width / 2}px` }
  }
  if (!searchOpen.value && !historyOpen.value && document.activeElement instanceof HTMLElement) overlayTrigger = document.activeElement
  if (trigger) overlayTrigger = trigger
  filterPanel.value = null
  historyOpen.value = false
  searchDraft.value = query.value
  searchOpen.value = true
  await nextTick()
  searchInput.value?.focus({ preventScroll: true })
}

function restoreFocus(target: HTMLElement | null) {
  if (!target?.isConnected) return
  nextTick(() => target.focus({ preventScroll: true }))
}

function closeSearch() {
  searchOpen.value = false
  clearAttachedImage()
  restoreFocus(overlayTrigger)
  overlayTrigger = null
}

async function runSearch(term = searchDraft.value) {
  const normalized = term.trim()
  if (!normalized && !attachedImage.value) return
  const imageFingerprint = attachedImage.value
    ? await (pendingImageFingerprint || Promise.resolve(visualSearchSeed.value))
    : null
  const finalQuery = normalized || 'Visual matches'
  if (normalized) {
    searchHistory.value = [
      { query: normalized, searchedAt: Date.now() },
      ...searchHistory.value.filter((item) => item.query !== normalized),
    ].slice(0, 6)
    storeHistory()
  }
  query.value = finalQuery
  clearAttachedImage()
  overlayTrigger = null
  const resultSearch = new URLSearchParams({ query: finalQuery })
  if (imageFingerprint != null) resultSearch.set('visual', String(imageFingerprint))
  navigate(`/search/results?${resultSearch.toString()}`)
}

async function showHistory() {
  searchOpen.value = false
  historyOpen.value = true
  await nextTick()
  historyLayer.value?.focus()
}

function closeHistory() {
  historyOpen.value = false
  restoreFocus(overlayTrigger)
  overlayTrigger = null
}

function activateNav(target: 'home' | 'categories' | 'cart' | 'offers' | 'saved' | 'login') {
  const paths = { home: '/', categories: '/categories', cart: '/cart', offers: '/offers', login: '/accounts/login', saved: '/accounts/login' }
  navigate(paths[target])
}

function chooseLanguage(language: string) {
  selectedLanguage.value = language
  try {
    localStorage.setItem('shop-language', language)
  } catch {
    // Language selection still works when storage is unavailable.
  }
  navigate('/')
}

function applyLanguage() {
  const language = settingsLanguages.find((option) => option.locale === languageDraft.value)
  if (language) {
    selectedLanguage.value = language.name
    try {
      localStorage.setItem('shop-language', language.name)
    } catch {
      // The URL remains the source of truth when storage is unavailable.
    }
  }
  navigate(`/language-settings?locale=${encodeURIComponent(languageDraft.value)}`)
}

function applyTermsLanguage(event: Event) {
  termsLanguage.value = (event.target as HTMLSelectElement).value
  navigate(`/shop-cash-terms?locale=${encodeURIComponent(termsLanguage.value)}`)
}

function openLoginLanguage() {
  if (document.activeElement instanceof HTMLElement) overlayTrigger = document.activeElement
  loginLanguageOpen.value = true
}

function closeLoginLanguage() {
  loginLanguageOpen.value = false
  restoreFocus(overlayTrigger)
  overlayTrigger = null
}

function toggleLoginLanguage() {
  if (loginLanguageOpen.value) closeLoginLanguage()
  else openLoginLanguage()
}

function chooseLoginLanguage(locale: LoginLocale) {
  const language = loginLocaleByCode[locale]
  loginLanguageOpen.value = false
  overlayTrigger = null
  loginLocale.value = locale
  selectedLanguage.value = language.name
  email.value = ''
  emailError.value = ''
  loginComplete.value = false
  try {
    localStorage.setItem('shop-language', language.name)
  } catch {
    // The current session still updates when storage is unavailable.
  }
  navigate(`/accounts/login?locale=${encodeURIComponent(locale)}`)
  nextTick(() => emailInput.value?.focus())
}

function handleLoginPageClick() {
  if (loginLanguageOpen.value) closeLoginLanguage()
}

function leaveProduct() {
  if (window.history.length > 1) window.history.back()
  else navigate('/')
}

function scrollToCategory(slug: string) {
  const target = document.getElementById(`home-${slug}`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function shiftRail(id: string, direction: number) {
  document.getElementById(id)?.scrollBy({ left: direction * 720, behavior: 'smooth' })
}

function toggleQuickFilter(name: string) {
  activeQuickFilters.value = activeQuickFilters.value.includes(name)
    ? activeQuickFilters.value.filter((item) => item !== name)
    : [...activeQuickFilters.value, name]
}

async function toggleFilter(panel: Exclude<FilterPanel, null>, event?: Event) {
  if (filterPanel.value === panel) {
    closeFilter()
    return
  }
  if (event?.currentTarget instanceof HTMLElement) {
    if (!filterPanel.value) filterTrigger = event.currentTarget
    const rect = event.currentTarget.getBoundingClientRect()
    const width = panel === 'category' ? 375 : panel === 'shipping' ? 250 : 300
    filterAnchor.value = {
      left: Math.max(84, Math.min(window.innerWidth - width - 16, rect.left + rect.width / 2 - width / 2)),
      top: rect.bottom + 5,
    }
  }
  filterPanel.value = panel
  await nextTick()
  filterPopover.value?.focus()
}

function closeFilter() {
  filterPanel.value = null
  restoreFocus(filterTrigger)
  filterTrigger = null
}

function toggleAllSection(section: ExpandableFilter) {
  allExpanded.value = { ...allExpanded.value, [section]: !allExpanded.value[section] }
}

function selectCategoryFilter(name: string) {
  selectedCategoryFilter.value = name
}

function toggleMultiFilter(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

function toggleSizeFilter(size: string) {
  selectedSizes.value = toggleMultiFilter(selectedSizes.value, size)
}

function toggleColorFilter(color: string) {
  selectedColors.value = toggleMultiFilter(selectedColors.value, color)
}

function updateMinimumPrice(value: number) {
  minimumPrice.value = Math.max(0, Math.min(value || 0, maximumPrice.value))
}

function updateMaximumPrice(value: number) {
  maximumPrice.value = Math.min(2000, Math.max(value || 0, minimumPrice.value))
}

function shippingCode(country: string) {
  if (!country || country === 'Hong Kong SAR') return 'HK'
  const known: Record<string, string> = {
    China: 'CN',
    Japan: 'JP',
    Singapore: 'SG',
    'South Korea': 'KR',
    'United Kingdom': 'GB',
    'United States': 'US',
  }
  return known[country] || country.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function resetFilters() {
  selectedCategoryFilter.value = 'All categories'
  activeQuickFilters.value = []
  selectedSort.value = 'Relevance'
  selectedRating.value = 'All ratings'
  selectedGender.value = ''
  selectedCountry.value = ''
  selectedSizes.value = []
  selectedColors.value = []
  minimumPrice.value = 0
  maximumPrice.value = 2000
}

function toggleSave(event: Event) {
  event.preventDefault()
  navigate('/accounts/login')
}

function openProduct(product: Product) {
  const verified = verifiedProductFor(product)
  if (!verified) return
  const path = pathFromSourceUrl(verified.sourceUrl)
  if (path) navigate(path)
}

function canOpenProduct(product: Product) {
  return Boolean(verifiedProductFor(product))
}

function openBrand(brand: BrandCard) {
  if (brand === gathreBrand) navigate('/m/gathre')
}

function canOpenBrand(brand: BrandCard) {
  return brand === gathreBrand
}

function categoryDetailForName(name: string) {
  const normalizedName = name.trim().toLowerCase()
  return Object.values(categoryDetails).find((detail) => detail.title.toLowerCase() === normalizedName)
}

function canOpenCategory(name: string) {
  return Boolean(categoryDetailForName(name))
}

function openCategory(name: string) {
  const detail = categoryDetailForName(name)
  if (detail) navigate(detail.path)
}

function showShareToast() {
  shareToastMessage.value = 'Share link copied!'
  if (shareToastTimer) clearTimeout(shareToastTimer)
  shareToastTimer = setTimeout(() => {
    shareToastMessage.value = ''
    shareToastTimer = undefined
  }, 2000)
}

async function copyShareLink(url: string) {
  try {
    await navigator.clipboard?.writeText(url)
  } catch {
    // Clipboard access can be unavailable in embedded browsers; the toast still confirms the action.
  }
  showShareToast()
}

function openProductShare() {
  void copyShareLink(currentProductShareUrl.value)
}

function toggleProductActions() {
  if (productActionsOpen.value) {
    closeProductActions()
    return
  }
  if (document.activeElement instanceof HTMLElement) overlayTrigger = document.activeElement
  productActionsOpen.value = true
  nextTick(() => productActionsLayer.value?.focus())
}

function closeProductActions() {
  productActionsOpen.value = false
  restoreFocus(overlayTrigger)
  overlayTrigger = null
}

function openProductPanel(view: Exclude<ProductPanelView, null>) {
  if (view === 'reviews' && !currentProductReviewEntries.value.length) return
  if (document.activeElement instanceof HTMLElement) overlayTrigger = document.activeElement
  productReviewQuery.value = ''
  productReviewSort.value = 'Most recent'
  productReviewRating.value = 'All ratings'
  productReviewColor.value = 'All colors'
  productPanelView.value = view
  nextTick(() => productPanelLayer.value?.focus())
}

function closeProductPanel() {
  productPanelView.value = null
  restoreFocus(overlayTrigger)
  overlayTrigger = null
}

function toggleProductDescription() {
  if (isGathreProduct.value) {
    openProductPanel('description')
    return
  }
  productDescriptionExpanded.value = !productDescriptionExpanded.value
}

function toggleStoreMenu() {
  if (storeMenuOpen.value) {
    closeStoreMenu()
    return
  }
  if (document.activeElement instanceof HTMLElement) overlayTrigger = document.activeElement
  storePanelView.value = 'overview'
  storeReviewQuery.value = ''
  storeMenuOpen.value = true
  nextTick(() => storeMenuLayer.value?.focus())
}

function closeStoreMenu() {
  storeMenuOpen.value = false
  storePanelView.value = 'overview'
  restoreFocus(overlayTrigger)
  overlayTrigger = null
}

function showStorePanel(view: StorePanelView) {
  if (view === 'reviews' && !isGathreStore.value) return
  storePanelView.value = view
  nextTick(() => storeMenuLayer.value?.focus())
}

function selectStoreCollection(path: string) {
  storeSearchQuery.value = ''
  resetStoreFilters()
  navigate(path)
}

async function shareStore() {
  if (!isGathreStore.value) return
  await copyShareLink('https://shop.app/m/gathre')
}

function openStoreFilter(panel: Exclude<StoreFilterPanel, null>, event?: Event) {
  if (document.activeElement instanceof HTMLElement) overlayTrigger = document.activeElement
  if (event?.currentTarget instanceof HTMLElement) {
    const rect = event.currentTarget.getBoundingClientRect()
    const panelHeight = panel === 'sort' ? 245 : panel === 'price' ? 171 : window.innerHeight - 16
    storeFilterAnchor.value = {
      left: Math.max(84, Math.min(window.innerWidth - 316, rect.left + rect.width / 2 - 150)),
      top: Math.max(16, Math.min(window.innerHeight - panelHeight - 16, rect.bottom + 8)),
    }
  }
  storeFilterPanel.value = panel
  nextTick(() => storeFilterLayer.value?.focus())
}

function closeStoreFilter() {
  storeFilterPanel.value = null
  restoreFocus(overlayTrigger)
  overlayTrigger = null
}

function resetStoreFilters() {
  storeOnSale.value = false
  storeInStock.value = true
  storeSort.value = 'Best selling'
  storeMinimumPrice.value = 0
  storeMaximumPrice.value = 2000
}

function resetOpenStoreFilter() {
  if (storeFilterPanel.value === 'sort') {
    storeSort.value = 'Best selling'
    return
  }
  if (storeFilterPanel.value === 'price') {
    storeMinimumPrice.value = 0
    storeMaximumPrice.value = 2000
    return
  }
  resetStoreFilters()
}

function closeStoreMenuAndScroll(targetId: string) {
  closeStoreMenu()
  nextTick(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function updateStoreMinimumPrice(value: number) {
  storeMinimumPrice.value = Math.max(0, Math.min(value || 0, storeMaximumPrice.value))
}

function updateStoreMaximumPrice(value: number) {
  storeMaximumPrice.value = Math.min(2000, Math.max(value || 0, storeMinimumPrice.value))
}

function removeCartItem(key: string) {
  cartItems.value = cartItems.value.filter((item) => item.key !== key)
  storeCart()
}

function handleImageError(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  if (image.dataset.fallbackApplied) return
  image.dataset.fallbackApplied = 'true'
  const fallback = image.dataset.fallback
  if (fallback === 'hide') {
    image.hidden = true
    return
  }
  image.src = fallback || DEFAULT_IMAGE_FALLBACK
}

function categoryFallback(slug: string, index = 0) {
  const filenames: Record<string, [string, string]> = {
    women: ['women-1.webp', 'women-2.webp'],
    men: ['men-1.webp', 'men-2.webp'],
    beauty: ['beauty-1.webp', 'beauty-2.webp'],
    home: ['home-1.webp', 'home-2.webp'],
    'fitness-nutrition': ['fitness-1.webp', 'fitness-2.webp'],
    'baby-toddler': ['baby-toddler-1.webp', 'baby-toddler-2.webp'],
    'food-drinks': ['food-drinks-bg-1.webp', 'food-drinks-bg-2.webp'],
    'pet-supplies': ['pet-supplies-1.webp', 'pet-supplies-2.webp'],
  }
  const options = filenames[slug] || filenames.home!
  return `/assets/images/categories/${options[Math.abs(index) % options.length]}`
}

function handleHeroMediaError() {
  heroMediaFailed.value = true
}

function hashText(value: string) {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

async function fingerprintImage(file: File) {
  const fallback = hashText(`${file.name}:${file.size}:${file.type}:${file.lastModified}`)
  if (typeof file.arrayBuffer !== 'function') return fallback
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    let hash = 2166136261
    for (const byte of bytes) {
      hash ^= byte
      hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
  } catch {
    return fallback
  }
}

function attachImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(file)
  attachedImage.value = objectUrl
  pendingImageFingerprint = fingerprintImage(file).then((fingerprint) => {
    visualSearchSeed.value = fingerprint
    return fingerprint
  })
}

function clearAttachedImage() {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = ''
  attachedImage.value = ''
  pendingImageFingerprint = null
  if (fileInput.value) fileInput.value.value = ''
}

function submitLogin() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = loginCopy.value.error
    return
  }
  emailError.value = ''
  loginComplete.value = true
}

function handleScroll() {
  const bounds = heroSearch.value?.getBoundingClientRect()
  isStickySearchVisible.value = Boolean(bounds && bounds.height > 0 && bounds.bottom <= 0)
}

function handleResize() {
  handleScroll()
  if (searchOrigin.value === 'hero' && heroSearch.value) {
    const bounds = heroSearch.value.getBoundingClientRect()
    searchAnchor.value = { top: `${bounds.top + window.scrollY}px`, left: `${bounds.left + bounds.width / 2}px` }
  }
}

function activeDialogElement() {
  if (storeFilterPanel.value) return storeFilterLayer.value
  if (productPanelView.value) return productPanelLayer.value
  if (storeMenuOpen.value) return storeMenuLayer.value
  if (filterPanel.value) return filterPopover.value
  if (historyOpen.value) return historyLayer.value
  if (searchOpen.value) return searchLayer.value
  return null
}

function trapDialogFocus(event: KeyboardEvent) {
  const dialog = activeDialogElement()
  if (!dialog) return
  const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input, select, a[href], [tabindex]:not([tabindex="-1"])')].filter((element) => {
    let current: HTMLElement | null = element
    while (current && current !== dialog) {
      const style = window.getComputedStyle(current)
      if (style.display === 'none' || style.visibility === 'hidden' || current.hidden) return false
      current = current.parentElement
    }
    return !element.hasAttribute('disabled')
  })
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable.at(-1)!
  if (!dialog.contains(document.activeElement)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    trapDialogFocus(event)
    return
  }
  if (event.key !== 'Escape') return
  if (productActionsOpen.value) {
    event.preventDefault()
    closeProductActions()
    return
  }
  if (!hasOpenDialog.value) return
  event.preventDefault()
  if (loginLanguageOpen.value) closeLoginLanguage()
  else if (storeFilterPanel.value) closeStoreFilter()
  else if (productPanelView.value) closeProductPanel()
  else if (storeMenuOpen.value && storePanelView.value !== 'overview') showStorePanel('overview')
  else if (storeMenuOpen.value) closeStoreMenu()
  else if (filterPanel.value) closeFilter()
  else if (historyOpen.value) closeHistory()
  else if (searchOpen.value) closeSearch()
}

watch([searchOpen, historyOpen, loginLanguageOpen, filterPanel, productPanelView, storeMenuOpen, storeFilterPanel], ([search, history, _loginLanguage, filter, productPanel, storeMenu, storeFilter]) => {
  const mobileOverlay = window.matchMedia('(max-width: 900px)').matches && (search || Boolean(filter))
  document.body.classList.toggle('overlay-lock', history || mobileOverlay || Boolean(productPanel) || storeMenu || Boolean(storeFilter))
})

watch(currentProduct, (product) => {
  selectedProductVariantIndexes.value = defaultVariantIndexes(product)
  selectedProductImage.value = currentProductImages.value[0] || ''
  productDescriptionExpanded.value = false
  productActionsOpen.value = false
  productPanelView.value = null
  if (product) rememberRecentlyViewed(product)
}, { immediate: true })

watch(currentBrand, (brand, previousBrand) => {
  if (brand && brand.name !== previousBrand?.name) {
    storeFollowed.value = false
    storeSearchQuery.value = ''
    resetStoreFilters()
  }
})

watch([route, query, currentProduct, currentBrand, currentCategory, termsLanguage, loginLocale], () => {
  const titles: Record<RouteName, string> = {
    home: 'Shop | Shopping designed around you',
    categories: 'Explore - Shop',
    category: `${currentCategory.value || 'Category'} - Shop`,
    brand: `${currentBrand.value?.name || 'Store'} - Shop`,
    cart: 'Cart - Shop',
    offers: 'Shop - Your deals',
    results: `${query.value || 'Search'} - Shop`,
    login: loginLocale.value === 'en' ? 'Sign in – Shop account' : loginCopy.value.title,
    product: `${currentProduct.value?.name || 'Product'} - Shop`,
    language: 'Language - Shop',
    terms: currentTermsSections.value[0]?.title || 'Shop Rewards Terms (Global)',
  }
  document.title = titles[route.value]
}, { immediate: true })

watch([route, selectedLanguage, settingsLocale, termsLanguage, loginLocale], ([currentRoute, language, currentSettingsLocale, currentTermsLocale, currentLoginLocale]) => {
  if (currentRoute === 'login') {
    document.documentElement.lang = currentLoginLocale
    return
  }
  if (currentRoute === 'language') {
    document.documentElement.lang = languageSettingsCopy[currentSettingsLocale].htmlLang
    return
  }
  if (currentRoute === 'terms') {
    document.documentElement.lang = currentTermsLocale
    return
  }
  document.documentElement.lang = languageCodes[language] || 'en'
}, { immediate: true })

onMounted(() => {
  readHistory()
  window.addEventListener('popstate', syncLocation)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  handleScroll()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('popstate', syncLocation)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('overlay-lock')
  if (shareToastTimer) clearTimeout(shareToastTimer)
  clearAttachedImage()
})
</script>

<template>
  <div v-if="route === 'login'" class="account-page" @click="handleLoginPageClick">
    <div class="account-card">
      <ShopIcon name="mark" class="account-mark" />
      <template v-if="!loginComplete">
        <h2>{{ loginCopy.title }}</h2>
        <p>{{ loginCopy.subtitle }}</p>
        <form novalidate @submit.prevent="submitLogin">
          <label class="visually-hidden" for="email">{{ loginCopy.placeholder }}</label>
          <div class="account-input" :class="{ 'has-error': emailError }">
            <input id="email" ref="emailInput" v-model="email" type="email" autocomplete="email" :placeholder="loginCopy.placeholder" :aria-label="loginCopy.placeholder" :aria-invalid="emailError ? 'true' : undefined" :aria-describedby="emailError ? 'email-error' : undefined" autofocus @input="emailError = ''" />
          </div>
          <span v-if="emailError" id="email-error" class="account-error" role="alert">{{ emailError }}</span>
          <button type="submit">{{ loginCopy.action }}</button>
        </form>
        <small>{{ loginLegalParts.beforeTerms }}<a href="https://shop.app/terms-of-service">{{ loginCopy.termsLabel }}</a>{{ loginLegalParts.betweenLinks }}<a href="https://www.shopify.com/legal/privacy/app-users">{{ loginCopy.privacyLabel }}</a>{{ loginLegalParts.afterPrivacy }}</small>
      </template>
      <template v-else>
        <span class="account-success"><ShopIcon name="mail" /></span>
        <h1>查看您的邮箱</h1>
        <p>我们已向 {{ email }} 发送登录链接</p>
        <button class="account-back" @click="loginComplete = false">使用其他邮箱</button>
      </template>
    </div>
    <button class="language-button" :aria-label="loginCopy.changeLanguage" :aria-expanded="loginLanguageOpen" @click.stop="toggleLoginLanguage">{{ loginCopy.name }} <ShopIcon name="chevron-down" :class="{ 'is-open': loginLanguageOpen }" /></button>
    <div v-if="loginLanguageOpen" ref="loginLanguageLayer" class="login-language-popover" @click.stop>
      <ul>
        <li v-for="language in loginLocaleOptions" :key="language.locale"><a :href="`/accounts/login?locale=${language.locale}`" :aria-current="loginLocale === language.locale ? 'page' : undefined" @click.prevent="chooseLoginLanguage(language.locale)">{{ language.name }}</a></li>
      </ul>
    </div>
  </div>

  <template v-else>
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <nav class="side-nav" aria-label="Primary navigation" :inert="hasOpenDialog">
      <button class="brand-button" aria-label="Shop home" title="Shop home" @click="activateNav('home')"><ShopIcon name="mark" /></button>
      <div class="side-nav__links">
        <button class="nav-icon" :class="{ 'is-active': navActive === 'home' }" aria-label="Home" title="Home" @click="activateNav('home')"><ShopIcon name="home" /></button>
        <button class="nav-icon" :class="{ 'is-active': navActive === 'categories' }" aria-label="Explore" title="Explore" @click="activateNav('categories')"><ShopIcon name="grid" /></button>
        <button class="nav-icon" :class="{ 'is-active': navActive === 'cart' }" aria-label="View Cart" title="Cart" @click="activateNav('cart')"><ShopIcon name="cart" /></button>
        <button class="nav-icon" :class="{ 'is-active': navActive === 'offers' }" aria-label="Deals" title="Deals" @click="activateNav('offers')"><ShopIcon name="tag" /></button>
        <button class="nav-icon" aria-label="Saved items" title="Saved items" @click="activateNav('saved')"><ShopIcon name="heart" /></button>
      </div>
      <button class="side-signin" aria-label="Sign in" @click="activateNav('login')"><ShopIcon name="profile" /><span>Sign in</span></button>
    </nav>

    <main id="main-content" class="site-shell" :inert="searchOpen || historyOpen" :class="[`route-${route}`, { 'search-is-open': searchOpen && route === 'home' }]">
      <template v-if="route === 'home'">
        <a class="download-banner" href="https://shop.app/download" target="_blank" rel="noreferrer">
          <span class="app-icon">shop</span><strong>Download Shop app.</strong><span>Available on iOS &amp; Android</span><ShopIcon name="arrow-right" />
        </a>

        <section ref="hero" class="hero" aria-labelledby="hero-title">
          <img class="hero-poster" src="/assets/shop-hero-poster.webp" alt="" aria-hidden="true" />
          <video v-show="!heroMediaFailed" class="hero-video" autoplay muted loop playsinline poster="/assets/shop-hero-poster.webp" @error="handleHeroMediaError">
            <source src="/assets/shop-hero.mp4" type="video/mp4" @error="handleHeroMediaError" />
          </video>
          <div class="hero-fallback" :class="{ 'is-visible': heroMediaFailed }" aria-hidden="true"><div v-for="(image, index) in heroImages.slice(0, 4)" :key="image" :class="`hero-piece hero-piece--${index + 1}`"><div class="hero-piece__tilt"><img :src="image" alt="" draggable="false" /></div></div></div>
          <h1 id="hero-title" class="shop-wordmark"><ShopIcon name="wordmark" /></h1>
          <button ref="heroSearch" class="hero-search" type="button" aria-label="Search products and stores" @click="openSearch">
            <span class="search-camera"><ShopIcon name="camera" /></span><span>What are you shopping for today?</span><span class="search-go"><ShopIcon name="arrow-right" /></span>
          </button>
          <div class="category-pills" aria-label="Popular categories">
            <button v-for="category in categories" :key="category.slug" @click="scrollToCategory(category.slug)"><img :src="category.chipImage" :alt="category.name" :data-fallback="categoryFallback(category.slug)" @error="handleImageError" /><span>{{ category.name }}</span></button>
          </div>
        </section>

        <section class="category-showcase section-pad" aria-label="Browse categories">
          <button class="rail-arrow rail-arrow--left" aria-label="Go to the previous item" @click="shiftRail('category-rail', -1)"><ShopIcon name="chevron-left" /></button>
          <div id="category-rail" class="category-rail">
            <article v-for="group in categories" :id="`home-${group.slug}`" :key="group.slug" class="category-group">
              <component :is="canOpenCategory(group.name) ? 'button' : 'div'" class="section-heading heading-button" :class="{ 'is-interactive': canOpenCategory(group.name) }" @click="openCategory(group.name)"><span>{{ group.name }}</span><ShopIcon name="chevron-right" /></component>
              <div class="category-grid">
                <component :is="canOpenCategory(item.name) ? 'button' : 'div'" v-for="item in group.items" :key="item.name" class="category-tile" :class="{ 'is-interactive': canOpenCategory(item.name) }" @click="openCategory(item.name)"><img :src="item.image" :alt="item.name" loading="lazy" :data-fallback="categoryFallback(group.slug)" @error="handleImageError" /><span>{{ item.name }}</span></component>
              </div>
            </article>
          </div>
          <button class="rail-arrow rail-arrow--right" aria-label="Go to the next item" @click="shiftRail('category-rail', 1)"><ShopIcon name="chevron-right" /></button>
        </section>

        <section v-for="section in brandSections" :id="section.slug" :key="section.slug" class="brand-section section-pad">
          <component :is="canOpenCategory(section.title) ? 'button' : 'div'" class="section-title-row" :class="{ 'is-interactive': canOpenCategory(section.title) }" @click="openCategory(section.title)"><h2>{{ section.title }}</h2><ShopIcon name="chevron-right" /></component>
          <div class="brand-rail-wrap">
            <div :id="`${section.slug}-rail`" class="brand-rail">
              <article v-for="brand in section.brands" :key="brand.name" class="brand-card">
                <component :is="canOpenBrand(brand) ? 'button' : 'div'" class="brand-card__open" :class="{ 'is-interactive': canOpenBrand(brand) }" :aria-label="canOpenBrand(brand) ? `Open ${brand.name}` : undefined" @click="openBrand(brand)">
                  <img class="brand-cover" :src="brand.cover" :alt="brand.name" loading="lazy" data-fallback="/assets/images/categories/home-1.webp" @error="handleImageError" /><span class="brand-shade"></span>
                  <span class="brand-meta"><strong>{{ brand.name }}</strong><span><ShopIcon name="star" /> {{ brand.rating }} ({{ brand.reviews }})</span></span>
                  <img v-if="brand.logo" class="brand-logo" :src="brand.logo" :alt="`${brand.name} logo`" loading="lazy" data-fallback="hide" @error="handleImageError" />
                  <span class="product-strip" aria-hidden="true"><img v-for="product in brand.products" :key="product" :src="product" alt="" loading="lazy" data-fallback="/assets/images/categories/home-2.webp" @error="handleImageError" /></span>
                </component>
                <button class="favorite-button" :aria-label="`Add ${brand.name} to saved items`" @click="toggleSave"><ShopIcon name="heart" /></button>
              </article>
            </div>
            <button class="rail-arrow brand-next" :aria-label="`Show more ${section.title} stores`" @click="shiftRail(`${section.slug}-rail`, 1)"><ShopIcon name="chevron-right" /></button>
          </div>
        </section>

        <SiteFooter @navigate="navigate" />
      </template>

      <template v-else-if="route === 'categories'">
        <section class="explore-page">
          <h1>Explore</h1>
          <div class="story-rail">
            <button v-for="story in exploreStories" :key="story.title" class="story-card" @click="runSearch(story.title)"><img :src="story.image" :alt="story.title" /><span class="story-shade"></span><span class="story-copy"><strong>{{ story.title }}</strong><small>{{ story.description }}</small></span><span class="story-arrow"><ShopIcon name="arrow-right" /></span></button>
          </div>
          <h2>Browse categories</h2>
          <div class="browse-grid">
            <component :is="canOpenCategory(item.name) ? 'button' : 'div'" v-for="item in browseCategories" :key="item.name" class="browse-card" :class="{ 'is-interactive': canOpenCategory(item.name) }" :style="{ backgroundColor: item.color }" @click="openCategory(item.name)"><strong>{{ item.name }}</strong><span><img v-for="image in item.images" :key="image" :src="image" alt="" @error="handleImageError" /></span></component>
          </div>
          <section v-for="(section, index) in catalogSections" :key="section.title" class="catalog-section">
            <component :is="canOpenCategory(section.query === 'menswear' ? 'Menswear' : section.query) ? 'button' : 'div'" class="catalog-heading" :class="{ 'is-interactive': canOpenCategory(section.query === 'menswear' ? 'Menswear' : section.query) }" @click="openCategory(section.query === 'menswear' ? 'Menswear' : section.query)">{{ section.title }} <ShopIcon name="chevron-right" /></component>
            <div class="catalog-rail-wrap">
              <button class="catalog-arrow left" aria-label="Go to the previous item" @click="shiftRail(`catalog-rail-${index}`, -1)"><ShopIcon name="chevron-left" /></button>
              <div :id="`catalog-rail-${index}`" class="catalog-rail">
                <article v-for="product in section.products" :key="product.name" class="catalog-card" :class="{ 'is-interactive': canOpenProduct(product) }" :role="canOpenProduct(product) ? 'link' : undefined" :tabindex="canOpenProduct(product) ? 0 : undefined" @click="openProduct(product)" @keydown.enter.self.prevent="openProduct(product)" @keydown.space.self.prevent="openProduct(product)"><div class="product-image"><img :src="product.image" :alt="product.name" @error="handleImageError" /><span v-if="product.discount" class="discount">{{ product.discount }}</span><button aria-label="Add to saved items" @click.stop="toggleSave"><ShopIcon name="heart" /></button></div><small>{{ product.store }}</small><strong>{{ product.name }}</strong><span v-if="product.reviews" class="rating"><ShopIcon name="star" /> ({{ product.reviews }})</span><b>{{ product.price }}</b><del v-if="product.oldPrice">{{ product.oldPrice }}</del></article>
              </div>
              <button class="catalog-arrow right" aria-label="Go to the next item" @click="shiftRail(`catalog-rail-${index}`, 1)"><ShopIcon name="chevron-right" /></button>
            </div>
          </section>
        </section>
        <SiteFooter @navigate="navigate" />
      </template>

      <section v-else-if="route === 'category'" class="category-page">
        <template v-if="currentCategory">
          <header class="category-detail-header">
            <h1>{{ currentCategory === 'Women' ? 'Womenswear' : currentCategory }}</h1>
            <div><button @click="activateNav('categories')">All categories</button><ShopIcon name="chevron-right" /><span>{{ currentCategory === 'Women' ? 'Womenswear' : currentCategory }}</span></div>
          </header>
          <div v-if="categoryTopics.length" class="category-topic-wrap">
            <div id="category-topic-rail" class="category-topic-rail">
              <button v-for="(topic, topicIndex) in categoryTopics" :key="topic.path || topic.name" @click="topic.path ? navigate(topic.path) : openCategory(topic.name)"><img :src="topic.image" alt="" :data-fallback="categoryFallback(currentCategorySlug, topicIndex)" :style="{ backgroundImage: `url(${categoryFallback(currentCategorySlug, topicIndex)})` }" @error="handleImageError" /><span>{{ topic.name }}</span></button>
            </div>
            <button class="category-topic-next" aria-label="Show more categories" @click="shiftRail('category-topic-rail', 1)"><ShopIcon name="chevron-right" /></button>
          </div>
          <div v-if="categoryEditorialItems.length" class="category-editorials">
            <button v-for="(editorial, editorialIndex) in categoryEditorialItems" :key="editorial.title" :style="{ backgroundImage: `url(${categoryFallback(currentCategorySlug, editorialIndex)})` }" @click="editorial.path ? navigate(editorial.path) : runSearch(editorial.title)"><img :src="editorial.image" :alt="editorial.title" :data-fallback="categoryFallback(currentCategorySlug, editorialIndex)" @error="handleImageError" /><span><strong>{{ editorial.title }}</strong><small>{{ editorial.description }}</small></span><i><ShopIcon name="arrow-right" /></i></button>
          </div>
          <div v-if="categoryProductShelves.length" class="category-featured-shelves">
            <section v-for="(shelf, shelfIndex) in categoryProductShelves" :key="shelf.title" class="category-product-shelf">
              <header><h2>{{ shelf.title }}</h2><button :aria-label="`Browse ${shelf.title}`" @click="shiftRail(`category-shelf-${shelfIndex}`, 1)"><ShopIcon name="arrow-right" /></button></header>
              <div :id="`category-shelf-${shelfIndex}`" class="category-shelf-rail">
                <article v-for="(product, productIndex) in shelf.products" :key="product.id || product.name" class="category-mini-product" :class="{ 'is-interactive': canOpenProduct(product) }" :role="canOpenProduct(product) ? 'link' : undefined" :tabindex="canOpenProduct(product) ? 0 : undefined" @click="openProduct(product)" @keydown.enter.self.prevent="openProduct(product)" @keydown.space.self.prevent="openProduct(product)"><div :style="{ backgroundImage: `url(${categoryFallback(currentCategorySlug, shelfIndex + productIndex)})` }"><img :src="product.image" :alt="product.name" :data-fallback="categoryFallback(currentCategorySlug, shelfIndex + productIndex)" @error="handleImageError" /><span v-if="product.discount" class="discount">{{ product.discount }}</span><button aria-label="Add to saved items" @click.stop="toggleSave"><ShopIcon name="heart" /></button></div><small>{{ product.store }}</small><strong>{{ product.name }}</strong><span v-if="product.reviews" class="rating"><ShopIcon name="star" /> ({{ product.reviews }})</span><b>{{ product.price }}</b><del v-if="product.oldPrice">{{ product.oldPrice }}</del></article>
              </div>
            </section>
          </div>
          <section v-if="categoryFeaturedCategories.length" class="category-link-showcase" aria-label="Browse categories">
            <h2>Browse categories</h2>
            <div><button v-for="(item, itemIndex) in categoryFeaturedCategories" :key="item.path" :style="{ backgroundImage: `url(${categoryFallback(currentCategorySlug, itemIndex)})` }" @click="navigate(item.path)"><img :src="item.image" :alt="item.name" :data-fallback="categoryFallback(currentCategorySlug, itemIndex)" @error="handleImageError" /><span>{{ item.name }}</span></button></div>
          </section>
          <section v-if="currentCategoryBrands.length" class="category-store-showcase" aria-label="Stores to explore">
            <div class="category-store-grid">
              <article v-for="brand in currentCategoryBrands" :key="brand.name" class="brand-card">
                <component :is="canOpenBrand(brand) ? 'button' : 'div'" class="brand-card__open" :class="{ 'is-interactive': canOpenBrand(brand) }" :aria-label="canOpenBrand(brand) ? `Open ${brand.name}` : undefined" @click="openBrand(brand)">
                  <img class="brand-cover" :src="brand.cover" :alt="brand.name" data-fallback="/assets/images/categories/food-drinks-bg-1.webp" @error="handleImageError" /><span class="brand-shade"></span>
                  <span class="brand-meta"><strong>{{ brand.name }}</strong><span><ShopIcon name="star" /> {{ brand.rating }} ({{ brand.reviews }})</span></span>
                  <img v-if="brand.logo" class="brand-logo" :src="brand.logo" :alt="`${brand.name} logo`" data-fallback="hide" @error="handleImageError" />
                  <span class="product-strip" aria-hidden="true"><img v-for="productImage in brand.products" :key="productImage" :src="productImage" alt="" data-fallback="/assets/images/categories/food-drinks-bg-2.webp" @error="handleImageError" /></span>
                </component>
              </article>
            </div>
          </section>
          <SiteFooter @navigate="navigate" />
        </template>
        <div v-else class="product-not-found"><h1>Category not found</h1><button @click="activateNav('categories')">Browse categories</button></div>
      </section>

      <section v-else-if="route === 'brand'" class="brand-page" :class="{ 'brand-page--gathre': isGathreStore }">
        <template v-if="currentBrand">
          <div class="brand-page__hero" :inert="storeMenuOpen || Boolean(storeFilterPanel)" :style="isGathreStore ? { backgroundColor: gathreStore.theme } : undefined">
            <video v-if="isGathreStore" class="store-hero-video" :src="gathreStore.heroVideo" :poster="gathreStore.heroPoster" autoplay muted loop playsinline></video>
            <img v-else :src="currentBrand.cover" :alt="currentBrand.name" @error="handleImageError" />
            <span class="brand-shade"></span>
            <button class="store-menu-button" aria-label="Store information" :aria-expanded="storeMenuOpen" @click="toggleStoreMenu">
              <img v-if="isGathreStore" class="store-menu-logo" :src="gathreStore.avatar" alt="" />
              <ShopIcon v-else name="menu" />
            </button>
            <button class="store-follow-button" :aria-pressed="storeFollowed" @click="storeFollowed = !storeFollowed">{{ storeFollowed ? 'Following' : 'Follow' }}</button>
            <div class="brand-page__identity">
              <img v-if="isGathreStore" :src="gathreStore.wordmark" alt="Gathre" />
              <img v-else-if="currentBrand.logo" :src="currentBrand.logo" :alt="`${currentBrand.name} logo`" data-fallback="hide" @error="handleImageError" />
              <h1 :class="{ 'visually-hidden': currentBrand.logo || isGathreStore }">{{ currentBrand.name }}</h1>
              <span>{{ currentBrand.rating }} <ShopIcon name="star" /> {{ currentBrand.reviews }} Reviews</span>
            </div>
            <div v-if="isGathreStore" class="store-quick-links" aria-label="Gathre categories">
              <button v-for="item in gathreStore.quickLinks" :key="item.title" @click="selectStoreCollection(item.path)"><img :src="item.image" alt="" /><span>{{ item.title }}</span></button>
            </div>
            <div v-if="storeCollectionCards.length" id="store-collections" class="store-collections">
              <button v-for="item in storeCollectionCards" :key="item.title" @click="isGathreStore ? selectStoreCollection(item.path) : runSearch(`${currentBrand.name} ${item.title}`)">
                <img :src="item.image" :alt="item.title" @error="handleImageError" />
                <strong>{{ item.title }}</strong>
              </button>
            </div>
          </div>

          <section v-if="isGathreStore" id="store-products" class="store-products-section" :inert="storeMenuOpen || Boolean(storeFilterPanel)">
            <header><h2>Products</h2><label><ShopIcon name="search" /><input v-model="storeSearchQuery" type="search" :placeholder="`Search ${currentBrand.name}`" aria-label="Search store products" /></label></header>
            <div class="store-filters">
              <button aria-label="Store filters" :aria-expanded="storeFilterPanel === 'all'" @click="openStoreFilter('all', $event)"><ShopIcon name="sliders" /></button>
              <button class="store-sort" aria-label="Sort store products" :aria-expanded="storeFilterPanel === 'sort'" @click="openStoreFilter('sort', $event)"><span>Sort by</span><ShopIcon name="chevron-right" /></button>
              <button :class="{ active: storeOnSale }" :aria-pressed="storeOnSale" @click="storeOnSale = !storeOnSale">On sale</button>
              <button :class="{ active: storeMinimumPrice > 0 || storeMaximumPrice < 2000 }" :aria-expanded="storeFilterPanel === 'price'" @click="openStoreFilter('price', $event)">Price <ShopIcon name="chevron-right" /></button>
              <button :class="{ active: storeInStock }" :aria-pressed="storeInStock" @click="storeInStock = !storeInStock">In-stock</button>
            </div>
            <div v-if="storeProducts.length" class="results-grid store-results-grid">
              <article v-for="product in storeProducts" :key="product.id || product.name" class="result-product" :class="{ 'is-interactive': canOpenProduct(product) }" :role="canOpenProduct(product) ? 'link' : undefined" :tabindex="canOpenProduct(product) ? 0 : undefined" @click="openProduct(product)" @keydown.enter.self.prevent="openProduct(product)" @keydown.space.self.prevent="openProduct(product)">
                <div class="product-image"><img :src="product.image" :alt="product.name" @error="handleImageError" /><span v-if="product.discount" class="discount">{{ product.discount }}</span><button aria-label="Add to saved items" @click.stop="toggleSave"><ShopIcon name="heart" /></button></div>
                <small v-if="!isGathreStore">{{ product.store }}</small>
                <strong>{{ product.name }}</strong>
                <span v-if="productRatingTotal(product)" class="rating store-product-rating" :aria-label="`${productRatingText(product)} stars, ${productRatingTotal(product)} ratings`"><span><ShopIcon v-for="star in 5" :key="star" name="star" /></span> ({{ productRatingTotal(product) }})</span>
                <b>{{ product.price }}</b><del v-if="product.oldPrice">{{ product.oldPrice }}</del>
              </article>
            </div>
            <p v-else class="store-products-empty">No products match your filters.</p>
          </section>
          <section v-else id="store-products" class="store-captured-products" :inert="storeMenuOpen">
            <h2>Products</h2>
            <div><img v-for="productImage in currentBrand.products" :key="productImage" :src="productImage" :alt="`${currentBrand.name} product`" @error="handleImageError" /></div>
          </section>
          <SiteFooter :inert="storeMenuOpen || Boolean(storeFilterPanel)" @navigate="navigate" />

          <button v-if="storeFilterPanel" class="store-filter-dismiss" :class="{ 'store-filter-dismiss--all': storeFilterPanel === 'all' }" aria-label="Close store filters" @click="closeStoreFilter"></button>
          <section v-if="storeFilterPanel" ref="storeFilterLayer" class="store-filter-sheet" :class="`store-filter-sheet--${storeFilterPanel}`" role="dialog" aria-modal="true" :aria-label="storeFilterPanel === 'all' ? 'Store filters' : storeFilterPanel === 'price' ? 'Price' : 'Sort by'" tabindex="-1" :style="storeFilterPanel === 'all' ? undefined : { left: `${storeFilterAnchor.left}px`, top: `${storeFilterAnchor.top}px` }">
            <header v-if="storeFilterPanel === 'all'"><h2>Filters</h2><button aria-label="Close store filters" @click="closeStoreFilter"><ShopIcon name="close" /></button></header>
            <div v-if="storeFilterPanel === 'all' || storeFilterPanel === 'sort'" class="store-sort-options" :class="{ 'store-filter-section': storeFilterPanel === 'all' }">
              <h3 v-if="storeFilterPanel === 'all'">Sort by</h3>
              <label v-for="option in ['Best selling', 'Newest', 'Price: Low - High', 'Price: High - Low']" :key="option"><span>{{ option }}</span><input v-model="storeSort" name="store-sort" type="radio" :value="option" /></label>
            </div>
            <div v-if="storeFilterPanel === 'all'" class="store-filter-switch"><span>On sale</span><button role="switch" :aria-checked="storeOnSale" aria-label="Show sale products" @click="storeOnSale = !storeOnSale"><i></i></button></div>
            <div v-if="storeFilterPanel === 'all' || storeFilterPanel === 'price'" class="store-price-range" :class="{ 'store-filter-section': storeFilterPanel === 'all' }">
              <h3 v-if="storeFilterPanel === 'all'">Price</h3>
              <div class="price-range" :style="storePriceRangeStyle"><span class="price-range-track"></span><input v-model.number="storeMinimumPrice" aria-label="Store minimum price" type="range" min="0" max="2000" step="25" @input="updateStoreMinimumPrice(storeMinimumPrice)" /><input v-model.number="storeMaximumPrice" aria-label="Store maximum price" type="range" min="0" max="2000" step="25" @input="updateStoreMaximumPrice(storeMaximumPrice)" /></div>
              <div class="price-inputs"><label><span>$</span><input :value="storeMinimumPrice" aria-label="Store minimum price value" type="number" @change="updateStoreMinimumPrice(Number(($event.target as HTMLInputElement).value))" /></label><i></i><label><span>$</span><input :value="storeMaximumPrice >= 2000 ? '2000+' : storeMaximumPrice" aria-label="Store maximum price value" type="text" @change="updateStoreMaximumPrice(Number(($event.target as HTMLInputElement).value.replace(/[^0-9]/g, '')))" /></label></div>
            </div>
            <label v-if="storeFilterPanel === 'all'" class="store-stock-filter"><span>In-stock</span><input v-model="storeInStock" type="checkbox" /></label>
            <footer><button @click="resetOpenStoreFilter">Reset</button><button @click="closeStoreFilter">Done</button></footer>
          </section>

          <button v-if="storeMenuOpen" class="store-panel-dismiss" aria-label="Close store information" @click="closeStoreMenu"></button>
          <aside v-if="storeMenuOpen" ref="storeMenuLayer" class="store-panel" :class="`store-panel--${storePanelView}`" role="dialog" aria-modal="true" :aria-label="storePanelView === 'overview' ? 'Store information' : storePanelView === 'reviews' ? 'Gathre reviews' : `${storePanelView} policy`" tabindex="-1">
            <header class="store-panel-toolbar">
              <button v-if="storePanelView === 'overview'" aria-label="Close store information" @click="closeStoreMenu"><ShopIcon name="close" /></button>
              <button v-else class="store-panel-back" aria-label="Back to store information" @click="showStorePanel('overview')"><ShopIcon name="chevron-left" /></button>
              <button class="store-panel-share" :aria-label="`Share ${currentBrand.name}`" @click="shareStore"><ShopIcon name="share" /></button>
            </header>

            <template v-if="storePanelView === 'overview'">
              <div class="store-panel-brand"><img v-if="isGathreStore" :src="gathreStore.avatar" alt="" /><span v-else>{{ currentBrand.name.slice(0, 1) }}</span><div><h2>{{ currentBrand.name }}</h2><button v-if="isGathreStore" class="store-panel-rating" @click="showStorePanel('reviews')">{{ currentBrand.rating }} <ShopIcon name="star" /> ({{ currentBrand.reviews }})</button><span v-else class="store-panel-rating-static">{{ currentBrand.rating }} <ShopIcon name="star" /> ({{ currentBrand.reviews }})</span></div></div>
              <nav class="store-panel-navigation" aria-label="Store sections"><button @click="closeStoreMenuAndScroll('store-products')"><span>Products</span><ShopIcon name="chevron-right" /></button><button v-if="isGathreStore" @click="closeStoreMenuAndScroll('store-collections')"><span>Collections</span><ShopIcon name="chevron-right" /></button></nav>
              <section v-if="isGathreStore" class="store-panel-review-summary"><button class="store-reviews-open" @click="showStorePanel('reviews')"><span><b>Reviews</b><small>{{ currentBrand.reviews }} ratings</small></span><strong>{{ currentBrand.rating }}</strong><ShopIcon name="chevron-right" /></button><article><img :src="gathreReviews[0].image" alt="" /><div><span><ShopIcon v-for="star in 5" :key="star" name="star" /></span><strong>{{ gathreReviews[0].title }}</strong><p>{{ gathreReviews[0].body }}</p><small>{{ gathreReviews[0].reviewer }} · {{ gathreReviews[0].date }}</small></div></article></section>
              <section class="store-panel-links"><h3>Policies</h3><button v-if="isGathreStore" @click="showStorePanel('privacy')"><span>Privacy policy</span><ShopIcon name="chevron-right" /></button><button v-if="isGathreStore" @click="showStorePanel('refund')"><span>Refund policy</span><ShopIcon name="chevron-right" /></button><a v-else :href="currentBrandLinks.privacy" target="_blank" rel="noreferrer">Privacy policy</a></section>
              <section v-if="isGathreStore" class="store-panel-links"><h3>Contact</h3><a :href="currentBrandLinks.facebook" target="_blank" rel="noreferrer"><span>Facebook</span><ShopIcon name="arrow-right" /></a><a :href="currentBrandLinks.instagram" target="_blank" rel="noreferrer"><span>Instagram</span><ShopIcon name="arrow-right" /></a><a :href="currentBrandLinks.support" target="_blank" rel="noreferrer"><span>Customer support</span><ShopIcon name="arrow-right" /></a><a :href="currentBrandLinks.email"><span>hello@gathre.com</span><ShopIcon name="arrow-right" /></a><a :href="currentBrandLinks.phone"><span>888-474-0591</span><ShopIcon name="arrow-right" /></a><address>{{ currentBrandLinks.address }}</address></section>
              <a class="store-online-link" :href="currentBrandLinks.site" target="_blank" rel="noreferrer">Visit online store <ShopIcon name="arrow-right" /></a>
            </template>

            <template v-else-if="storePanelView === 'reviews'">
              <div class="store-reviews-heading"><h2>Reviews</h2><div><strong>{{ currentBrand.rating }}</strong><span><i><ShopIcon v-for="star in 5" :key="star" name="star" /></i>{{ currentBrand.reviews }} ratings</span></div></div>
              <label class="store-review-search"><ShopIcon name="search" /><input v-model="storeReviewQuery" type="search" placeholder="Search reviews" /></label>
              <div class="store-review-controls"><label><span>Sort by</span><select v-model="storeReviewSort"><option>Newest</option><option>Oldest</option></select><ShopIcon name="chevron-right" /></label><label><span>Rating</span><select v-model="storeReviewRating"><option>All ratings</option><option>5 stars</option><option>4 stars</option><option>3 stars</option><option>2 stars</option><option>1 star</option></select><ShopIcon name="chevron-right" /></label></div>
              <div class="store-review-list"><article v-for="review in visibleStoreReviews" :key="review.reviewer" class="store-review-card"><img :src="review.image" :alt="review.product" /><div><small>{{ review.product }}</small><span class="store-review-stars"><ShopIcon v-for="star in review.rating" :key="star" name="star" /></span><h3>{{ review.title }}</h3><p>{{ review.body }}</p><footer>{{ review.reviewer }} · {{ review.date }}</footer></div></article><p v-if="!visibleStoreReviews.length" class="store-review-empty">No reviews found.</p></div>
            </template>

            <template v-else>
              <article class="store-policy"><h2>{{ storePanelView === 'privacy' ? 'Privacy policy' : 'Refund policy' }}</h2><template v-if="storePanelView === 'privacy'"><p>This Privacy Policy describes how gathre.com collects, uses, and discloses your Personal Information when you visit or make a purchase from the Site.</p><h3>Collecting Personal Information</h3><p>When you visit the Site, Gathre collects information about your device, your interaction with the Site, and information necessary to process your purchases. Additional information may be collected when you contact customer support.</p><h3>Contact</h3><p>Questions about privacy practices may be sent to hello@gathre.com or mailed to {{ gathreStore.address }}.</p></template><template v-else><h3>Damages and Issues</h3><p>Inspect your order upon reception and contact Gathre immediately if an item is defective, damaged, or incorrect so the issue can be evaluated and made right.</p><h3>Returns + Exchanges</h3><p>Unused mats in their original packaging are accepted on a case-by-case basis. Refunds are credited to the original form of payment or a Gathre eGift Card within 7 business days after inspection. Shipping charges are not refundable and a $5.95 restocking fee applies.</p><p>International orders, warehouse orders, sale items, and orders made with merchandise credit cannot be returned.</p></template><a :href="storePanelView === 'privacy' ? currentBrandLinks.privacy : currentBrandLinks.refund" target="_blank" rel="noreferrer">Read the full policy <ShopIcon name="arrow-right" /></a></article>
            </template>
          </aside>
        </template>
        <div v-else class="product-not-found"><h1>Store not found</h1><button @click="activateNav('home')">Return home</button></div>
      </section>

      <section v-else-if="route === 'cart'" class="utility-page cart-page">
        <div v-if="!cartItems.length" class="empty-cart"><img src="/assets/images/empty-cart.png" alt="Empty shopping cart" /><h1>Your cart is empty</h1><p class="desktop-copy">Add products while you shop, so they'll be ready for checkout later.</p><p class="mobile-copy">Add products here to checkout</p></div>
        <div v-else class="filled-cart"><h1>Your cart</h1><article v-for="item in cartItems" :key="item.key"><img :src="item.image" :alt="item.product.name" /><div><small>{{ item.product.store }}</small><h2>{{ item.product.name }}</h2><small v-if="Object.keys(item.selectedOptions).length" class="cart-line-options">{{ Object.entries(item.selectedOptions).map(([name, value]) => `${name}: ${value}`).join(' / ') }}</small><span>Qty {{ item.quantity }}</span><strong>{{ item.product.price }}</strong></div><button :aria-label="`Remove ${item.product.name} from cart`" @click="removeCartItem(item.key)"><ShopIcon name="close" /></button></article><button class="cart-checkout" @click="activateNav('login')">Checkout</button></div>
        <section v-if="!cartItems.length" class="cart-recent"><h2>Recently viewed</h2><div><article v-for="product in recentlyViewedProducts" :key="product.name" :class="{ 'is-interactive': canOpenProduct(product) }" :role="canOpenProduct(product) ? 'link' : undefined" :tabindex="canOpenProduct(product) ? 0 : undefined" @click="openProduct(product)" @keydown.enter.self.prevent="openProduct(product)" @keydown.space.self.prevent="openProduct(product)"><div><img :src="product.image" :alt="product.name" /><span v-if="product.discount">{{ product.discount }}</span><button aria-label="Add to saved items" @click.stop="toggleSave"><ShopIcon name="heart" /></button></div><small>{{ product.store }}</small><strong>{{ product.name }}</strong><b>{{ product.price }}</b><del v-if="product.oldPrice">{{ product.oldPrice }}</del></article></div></section>
      </section>

      <section v-else-if="route === 'offers'" class="utility-page offers-page">
        <div class="offers-copy"><h1>Unlock all your deals</h1><p>Get access to deals from 1000s of top<br />brands on Shop*</p><button @click="activateNav('login')">Sign in or create account</button><small><a href="/shop-cash-terms">*Terms apply.</a> For more information, <a href="https://help.shop.app">visit our Help Center.</a></small></div>
      </section>

      <section v-else-if="route === 'product'" class="product-page">
        <button class="product-back" :inert="Boolean(productPanelView)" aria-label="Go back" @click="leaveProduct"><ShopIcon name="chevron-left" /></button>
        <template v-if="currentProduct">
          <div class="product-gallery" :inert="Boolean(productPanelView)"><div class="product-thumbnails"><button v-for="(image, index) in currentProductImages" :key="image" :class="{ active: selectedProductImage === image }" :aria-label="`View product image ${index + 1}`" @click="selectedProductImage = image"><img :src="image" alt="" /></button></div><div class="product-page__image"><img :src="selectedProductImage || currentProduct.image" :alt="currentProduct.name" @error="handleImageError" /></div></div>
          <div class="product-page__details" :inert="Boolean(productPanelView)">
            <header class="product-merchant"><img v-if="isGathreProduct" :src="gathreStore.avatar" alt="" /><span v-else>{{ currentProduct.store.slice(0, 1) }}</span><div><strong>{{ currentProduct.store }}</strong><small v-if="isGathreProduct">4.7 <ShopIcon name="star" /> (1607)</small></div><button v-if="isGathreProduct" aria-label="More product actions" :aria-expanded="productActionsOpen" @click="toggleProductActions"><ShopIcon name="more" /></button><button v-if="productActionsOpen" class="product-actions-dismiss" aria-label="Close product actions" @click="closeProductActions"></button><div v-if="productActionsOpen" ref="productActionsLayer" class="product-actions-popover" role="menu" tabindex="-1"><a :href="gathreStore.links.support" target="_blank" rel="noreferrer" role="menuitem"><ShopIcon name="compose" /> Contact {{ currentProduct.store }}</a></div></header>
            <h1>{{ currentProduct.name }}</h1>
            <button v-if="isGathreProduct && currentProductRatingCount && currentProductReviewEntries.length" class="product-rating" :aria-label="`${currentProductRating} stars, ${currentProductRatingCount} ratings, ${currentProductReviewCount} reviews`" @click="openProductPanel('reviews')"><span><ShopIcon v-for="star in 5" :key="star" name="star" /></span><b>{{ currentProductRating }}</b> {{ currentProductRatingCount }} ratings</button>
            <span v-else-if="isGathreProduct && currentProductRatingCount" class="product-rating product-rating--static" :aria-label="`${currentProductRating} stars, ${currentProductRatingCount} ratings, ${currentProductReviewCount} reviews`"><span><ShopIcon v-for="star in 5" :key="star" name="star" /></span><b>{{ currentProductRating }}</b> {{ currentProductRatingCount }} ratings</span>
            <span v-if="currentProductPurchaseCountLabel" class="product-popular">{{ currentProductPurchaseCountLabel }}</span>
            <span v-if="currentProductInventoryLabel" class="product-low-stock">{{ currentProductInventoryLabel }}</span>
            <div class="product-price"><strong>{{ currentProduct.price }}</strong><del v-if="currentProduct.oldPrice">{{ currentProduct.oldPrice }}</del><span v-if="currentProduct.discount" class="product-page__discount">{{ currentProduct.discount }}</span></div>
            <div v-if="currentProductVariantOptions.length" class="product-variant-groups">
              <fieldset v-for="option in currentProductVariantOptions" :key="option.name" class="product-variants" role="radiogroup" :aria-label="option.name">
                <legend>{{ option.name }} <strong>{{ selectedProductVariant(option)?.name }}</strong></legend>
                <button v-for="(variant, variantIndex) in option.values" :key="`${variant.name}-${variantIndex}`" role="radio" :aria-checked="selectedProductVariantIndexes[option.name] === variantIndex" :class="{ active: selectedProductVariantIndexes[option.name] === variantIndex, 'on-sale': variant.onSale }" @click="selectProductVariant(option, variant, variantIndex)">{{ variant.name }}<small v-if="variant.onSale">On sale</small></button>
              </fieldset>
            </div>
            <a v-if="currentProductPurchaseUrl" class="product-purchase" :href="currentProductPurchaseUrl" target="_blank" rel="noreferrer">Purchase at {{ currentProduct.store }} <ShopIcon name="arrow-right" /></a>
            <div class="product-secondary-actions"><button @click="activateNav('login')"><ShopIcon name="heart" /> Save</button><button @click="openProductShare"><ShopIcon name="share" /> Share</button></div>
            <section v-if="currentProductDescription" class="product-description">
              <h2>Description</h2>
              <p :class="{ expanded: productDescriptionExpanded }">{{ currentProductDescription }}</p>
              <button @click="toggleProductDescription">{{ !isGathreProduct && productDescriptionExpanded ? 'View less' : 'View more' }}</button>
            </section>
            <section v-if="currentProductRating && currentProductRatingCount" id="product-reviews" class="product-reviews">
              <h2>Reviews</h2>
              <div class="review-summary"><strong>{{ currentProductRating }}</strong><span><i><ShopIcon v-for="star in 5" :key="star" name="star" /></i>{{ currentProductRatingCount }} ratings</span></div>
              <div v-if="isGathreBabyChangingMat" class="product-review-distribution" aria-label="Rating distribution"><span v-for="item in [{ stars: 5, count: 149 }, { stars: 4, count: 5 }, { stars: 3, count: 5 }, { stars: 2, count: 1 }, { stars: 1, count: 0 }]" :key="item.stars"><b>{{ item.stars }}</b><ShopIcon name="star" /><i><span :style="{ width: `${item.count / 149 * 100}%` }"></span></i><small>{{ item.count }}</small></span></div>
              <div v-if="currentProductReviewEntries.length" class="product-review-rail">
                <article v-for="review in currentProductReviewEntries" :key="review.reviewer"><span class="product-review-stars"><ShopIcon v-for="star in review.rating" :key="star" name="star" /></span><p>{{ review.body }}</p><small>{{ review.reviewer }} · {{ review.date }}</small><img v-if="review.image" :src="review.image" alt="Review attachment" /></article>
              </div>
              <button v-if="currentProductReviewEntries.length" class="product-read-reviews" @click="openProductPanel('reviews')">Read more reviews</button>
            </section>
            <section v-if="isGathreProduct" class="product-delivery"><h2>Delivery &amp; Returns</h2><a v-if="currentProduct.requiresShipping && currentProductShippingUrl" :href="currentProductShippingUrl" target="_blank" rel="noreferrer"><ShopIcon name="mark" /><span>Shipping details</span><ShopIcon name="arrow-right" /></a><button @click="openProductPanel('return')"><span>Return policy</span><ShopIcon name="chevron-right" /></button></section>
            <section v-if="isGathreProduct" class="product-store-card"><img :src="gathreStore.avatar" alt="" /><span><strong>Gathre</strong><small>4.7 <ShopIcon name="star" /> (1607)</small></span><button @click="navigate('/m/gathre')">Visit store</button></section>
            <section v-if="isGathreProduct" class="product-related"><h2>You might also like</h2><div><button v-for="product in relatedGathreProducts" :key="product.id" @click="openProduct(product)"><img :src="product.image" :alt="product.name" /><strong>{{ product.name }}</strong><span>{{ product.price }}</span></button></div></section>
          </div>
          <button v-if="productPanelView" class="product-panel-dismiss" :aria-label="`Close ${productPanelView} panel`" @click="closeProductPanel"></button>
          <aside v-if="productPanelView" ref="productPanelLayer" class="product-panel" :class="`product-panel--${productPanelView}`" role="dialog" aria-modal="true" :aria-label="productPanelView === 'description' ? 'Product description' : productPanelView === 'reviews' ? 'Product reviews' : 'Return policy'" tabindex="-1">
            <header><button :aria-label="`Close ${productPanelView} panel`" @click="closeProductPanel"><ShopIcon name="close" /></button></header>
            <article v-if="productPanelView === 'description'" class="product-panel-description">
              <h2>Description</h2>
              <p class="product-description-copy">{{ currentProductDescription }}</p>
            </article>
            <section v-else-if="productPanelView === 'reviews'" class="product-panel-reviews">
              <h2>Reviews</h2>
              <div class="product-panel-rating" :data-review-count="currentProductReviewCount" :aria-label="`${currentProductRating} stars, ${currentProductRatingCount} ratings, ${currentProductReviewCount} reviews`"><strong>{{ currentProductRating }}</strong><span><i><ShopIcon v-for="star in 5" :key="star" name="star" /></i>{{ currentProductRatingCount }} ratings</span></div>
              <div v-if="currentProductReviewEntries.length" class="product-panel-distribution"><span v-for="item in [{ stars: 5, count: 149 }, { stars: 4, count: 5 }, { stars: 3, count: 5 }, { stars: 2, count: 1 }, { stars: 1, count: 0 }]" :key="item.stars"><b>{{ item.stars }}</b><ShopIcon name="star" /><i><span :style="{ width: `${item.count / 149 * 100}%` }"></span></i><small>{{ item.count }}</small></span></div>
              <label v-if="currentProductReviewEntries.length" class="product-panel-review-search"><ShopIcon name="search" /><input v-model="productReviewQuery" type="search" placeholder="Search reviews" aria-label="Search product reviews" /></label>
              <div v-if="currentProductReviewEntries.length" class="product-panel-review-controls">
                <label><span>Sort by</span><select v-model="productReviewSort" aria-label="Sort product reviews"><option>Most recent</option><option>Oldest</option><option>Highest rating</option><option>Lowest rating</option></select><ShopIcon name="chevron-right" /></label>
                <label><span>Rating</span><select v-model="productReviewRating" aria-label="Filter product reviews by rating"><option>All ratings</option><option v-for="rating in [5, 4, 3, 2, 1]" :key="rating">{{ rating }} stars</option></select><ShopIcon name="chevron-right" /></label>
                <label><span>Color</span><select v-model="productReviewColor" aria-label="Filter product reviews by color"><option>All colors</option><option v-for="color in productReviewColors" :key="color">{{ color }}</option></select><ShopIcon name="chevron-right" /></label>
              </div>
              <div v-if="currentProductReviewEntries.length" class="product-panel-review-list"><article v-for="review in visibleProductReviews" :key="review.reviewer"><header><span class="product-review-stars"><ShopIcon v-for="star in review.rating" :key="star" name="star" /></span><small>{{ review.variant }}</small></header><p>{{ review.body }}</p><img v-if="review.image" :src="review.image" alt="Review attachment" /><footer><span>{{ review.reviewer }}</span><time>{{ review.date }}</time></footer></article><p v-if="!visibleProductReviews.length" class="product-panel-review-empty">No reviews found.</p></div>
            </section>
            <article v-else class="product-panel-return">
              <h2>Return policy</h2>
              <h3>Damages and Issues:</h3><p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right. Although our products are stain and water resistant, they are not stain or water proof and should not be submerged (such as in a washing machine) and caution should be used when using pigmented items on your mat. We are not responsible for any stains, marks, or discoloring that occurs after the product is used.</p>
              <h3>Returns + Exchanges:</h3><p>Returns and Exchanges can be processed by following the link in our footer. We happily accept unused mats in their original packaging. Returns are handled on a case-by-case basis, so please reach out with any questions. Once the product has been received and inspected at our facility we will process the refund. Refunds can only be credited to your original form of payment or a gift card. If the product was a gift, your credit will be issued as a Gathre eGift Card. Your account will be credited within 7 business days and, if you've ordered an exchange, your account will be charged for the difference of the new item. Shipping charges are never included in a refund. Although we do pay to have returns shipped back to us, customers will be charged a $5.95 restocking fee for all returns, this will be taken from your original form of payment. International orders, warehouse orders, sale items, and orders made with merchandise credit cannot be returned.</p>
              <p>Regarding exchanges, you will be responsible for the shipping fees on your exchanged item and any difference in pricing will be charged to your original form of payment. Your exchange will be processed electronically once your original item has arrived at our warehouse. If there are any issues with our portal or if you have any other questions, please feel free to contact us at hello@gathre.com.</p>
              <h3>European Union 14 day cooling off period:</h3><p>Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.</p>
            </article>
          </aside>
        </template>
        <div v-else class="product-not-found"><h1>Product not found</h1><button @click="activateNav('home')">Return home</button></div>
      </section>

      <template v-else-if="route === 'language'">
        <section class="language-page">
          <h1>{{ settingsCopy.title }}</h1>
          <p>{{ settingsCopy.description }}</p>
          <form @submit.prevent="applyLanguage">
            <label class="language-select">
              <span>{{ settingsCopy.label }}</span>
              <select v-model="languageDraft" :aria-label="settingsCopy.label">
                <option disabled value="">{{ settingsCopy.label }}</option>
                <option v-for="language in settingsLanguages" :key="language.locale" :value="language.locale">{{ language.name }}</option>
              </select>
              <ShopIcon name="chevron-right" />
            </label>
            <button type="submit">{{ settingsCopy.update }}</button>
          </form>
        </section>
        <SiteFooter @navigate="navigate" />
      </template>

      <template v-else-if="route === 'terms'">
        <div class="terms-main">
          <article class="terms-page">
          <section v-for="(section, index) in currentTermsSections" :key="`${termsLanguage}-${index}`" :class="{ 'terms-heading': index === 0 }">
            <h2>{{ section.title }}</h2>
            <!-- This is static legal markup captured from Shop: only p, ul, li, strong, em, a[href]. -->
            <div class="terms-section-copy" v-html="section.html"></div>
          </section>
          <label class="terms-language">
            <span>{{ termsLanguageName }}</span>
            <span class="terms-language-icons"><ShopIcon name="globe" /><ShopIcon name="terms-chevron-down" /></span>
            <select :value="effectiveTermsLocale" aria-label="Select Language" @change="applyTermsLanguage">
              <option v-for="language in termsLanguages" :key="language.locale" :value="language.locale">{{ language.name }}</option>
            </select>
          </label>
          </article>
        </div>
        <SiteFooter @navigate="navigate" />
      </template>

      <section v-else class="results-page">
        <div class="filters-strip" :inert="Boolean(filterPanel)">
          <button class="filter-icon" aria-label="filter" aria-controls="filter-dialog" :aria-expanded="filterPanel === 'all'" :class="{ active: filterPanel === 'all' }" @click="toggleFilter('all', $event)"><ShopIcon name="sliders" /></button>
          <button :aria-pressed="activeQuickFilters.includes('Sells from')" :class="{ active: activeQuickFilters.includes('Sells from') }" @click="toggleQuickFilter('Sells from')">Sells from 🇭🇰</button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'category'" :class="{ active: filterPanel === 'category' || selectedCategoryFilter !== 'All categories' }" @click="toggleFilter('category', $event)">{{ selectedCategoryFilter === 'All categories' ? 'Category' : selectedCategoryFilter }} <ShopIcon name="chevron-right" /></button>
          <button :aria-pressed="activeQuickFilters.includes('On sale')" :class="{ active: activeQuickFilters.includes('On sale') }" @click="toggleQuickFilter('On sale')">On sale</button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'ratings'" :class="{ active: filterPanel === 'ratings' || selectedRating !== 'All ratings' }" @click="toggleFilter('ratings', $event)">{{ selectedRating === 'All ratings' ? 'Ratings' : selectedRating }} <ShopIcon name="chevron-right" /></button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'gender'" :class="{ active: filterPanel === 'gender' || selectedGender }" @click="toggleFilter('gender', $event)">{{ selectedGender || 'Gender' }} <ShopIcon name="chevron-right" /></button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'shipping'" :class="{ active: filterPanel === 'shipping' || selectedCountry }" @click="toggleFilter('shipping', $event)">Ships to - {{ shippingCode(selectedCountry) }} <ShopIcon name="chevron-right" /></button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'size'" :class="{ active: filterPanel === 'size' || selectedSizes.length }" @click="toggleFilter('size', $event)">{{ selectedSizes.length ? `Size (${selectedSizes.length})` : 'Size' }} <ShopIcon name="chevron-right" /></button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'color'" :class="{ active: filterPanel === 'color' || selectedColors.length }" @click="toggleFilter('color', $event)">{{ selectedColors.length ? `Color (${selectedColors.length})` : 'Color' }} <ShopIcon name="chevron-right" /></button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'price'" :class="{ active: filterPanel === 'price' || hasPriceFilter }" @click="toggleFilter('price', $event)">Price <ShopIcon name="chevron-right" /></button>
          <button aria-controls="filter-dialog" :aria-expanded="filterPanel === 'sort'" :class="{ active: filterPanel === 'sort' || selectedSort !== 'Relevance' }" @click="toggleFilter('sort', $event)">{{ selectedSort === 'Relevance' ? 'Sort by' : selectedSort }} <ShopIcon name="chevron-right" /></button>
        </div>
        <div class="merchant-rail-wrap" :inert="Boolean(filterPanel)"><button class="catalog-arrow left" aria-label="Go to the previous item" @click="shiftRail('merchant-rail', -1)"><ShopIcon name="chevron-left" /></button><div id="merchant-rail" class="merchant-rail"><button v-for="merchant in merchants" :key="merchant.name" class="merchant-card" :style="{ backgroundColor: merchant.color }" @click="runSearch(merchant.name)"><img v-if="merchant.image" class="merchant-bg" :src="merchant.image" :alt="merchant.name" @error="handleImageError" /><img v-if="merchant.logo" class="merchant-logo" :src="merchant.logo" :alt="merchant.name" data-fallback="hide" @error="handleImageError" /><span v-if="merchant.offer" class="merchant-offer">{{ merchant.offer }}</span><span><strong>{{ merchant.name }}</strong><small><ShopIcon name="star" /> {{ merchant.rating }} ({{ merchant.reviews }})</small></span></button></div><button class="catalog-arrow right" aria-label="Go to the next item" @click="shiftRail('merchant-rail', 1)"><ShopIcon name="chevron-right" /></button></div>
        <h1 :inert="Boolean(filterPanel)">Results</h1>
        <div class="results-grid" :inert="Boolean(filterPanel)">
          <article v-for="product in visibleResultProducts" :key="product.name" class="result-product" :class="{ 'is-interactive': canOpenProduct(product) }" :role="canOpenProduct(product) ? 'link' : undefined" :tabindex="canOpenProduct(product) ? 0 : undefined" @click="openProduct(product)" @keydown.enter.self.prevent="openProduct(product)" @keydown.space.self.prevent="openProduct(product)"><div class="product-image"><img :src="product.image" :alt="product.name" @error="handleImageError" /><span v-if="product.discount" class="discount">{{ product.discount }}</span><button aria-label="Add to saved items" @click.stop="toggleSave"><ShopIcon name="heart" /></button></div><small>{{ product.store }}</small><strong>{{ product.name }}</strong><span v-if="product.reviews" class="rating"><ShopIcon name="star" /><ShopIcon name="star" /><ShopIcon name="star" /><ShopIcon name="star" /><ShopIcon name="star" /> ({{ product.reviews }})</span><b>{{ product.price }}</b><del v-if="product.oldPrice">{{ product.oldPrice }}</del></article>
        </div>
        <div v-if="!visibleResultProducts.length" class="results-empty" :inert="Boolean(filterPanel)"><ShopIcon name="search" /><h2>No matching products</h2><p>Try another search or reset your filters.</p><button @click="resetFilters">Reset filters</button></div>
        <section class="related-searches" :inert="Boolean(filterPanel)"><h2>Related searches</h2><button v-for="term in relatedSearches" :key="term" @click="runSearch(term)">{{ term }} <ShopIcon name="arrow-right" /></button></section>

        <button v-if="filterPanel" class="filter-dismiss" :class="{ 'filter-dismiss--drawer': filterPanel === 'all' }" aria-label="Close filters" @click="closeFilter"></button>
        <section v-if="filterPanel" id="filter-dialog" ref="filterPopover" class="filter-popover" :class="`filter-popover--${filterPanel}`" :style="filterPopoverStyle" role="dialog" aria-modal="true" :aria-label="filterDialogLabel" tabindex="-1">
          <template v-if="filterPanel === 'all'">
            <header class="filter-drawer-header"><h2>Filters</h2><button aria-label="Close filter sheet" @click="closeFilter"><ShopIcon name="close" /></button></header>
            <ul class="all-filter-options">
              <li class="filter-section filter-section--sort" aria-label="Sort by filter">
                <p class="filter-section-title">Sort by</p>
                <label v-for="name in sortFilterOptions" :key="name" class="filter-radio-row"><span>{{ name }}</span><input v-model="selectedSort" name="all-sort" type="radio" :value="name" /></label>
              </li>
              <li class="filter-section filter-section--accordion">
                <button class="filter-accordion-button" :aria-expanded="allExpanded.category" @click="toggleAllSection('category')"><span>Category</span><span class="filter-plus" :class="{ expanded: allExpanded.category }"></span></button>
                <div v-if="allExpanded.category" class="filter-accordion-content">
                  <label class="filter-radio-row"><span>All categories</span><input v-model="selectedCategoryFilter" name="all-category" type="radio" value="All categories" /></label>
                  <button v-for="name in categoryFilterOptions.slice(1)" :key="name" class="filter-choice-row" :class="{ selected: selectedCategoryFilter === name }" @click="selectCategoryFilter(name)"><span>{{ name }}</span><ShopIcon name="chevron-right" /></button>
                </div>
              </li>
              <li class="filter-section filter-section--accordion">
                <button class="filter-accordion-button" :aria-expanded="allExpanded.color" @click="toggleAllSection('color')"><span>Color</span><span class="filter-plus" :class="{ expanded: allExpanded.color }"></span></button>
                <div v-if="allExpanded.color" class="filter-accordion-content">
                  <button v-for="option in colorFilterOptions" :key="option.name" class="filter-choice-row filter-color-row" :aria-pressed="selectedColors.includes(option.name)" @click="toggleColorFilter(option.name)"><span class="color-swatch" :style="{ backgroundColor: option.color }"></span><span>{{ option.name }}</span><span class="filter-checkbox" :class="{ checked: selectedColors.includes(option.name) }"><ShopIcon v-if="selectedColors.includes(option.name)" name="check" /></span></button>
                </div>
              </li>
              <li class="filter-section filter-section--accordion">
                <button class="filter-accordion-button" :aria-expanded="allExpanded.size" @click="toggleAllSection('size')"><span>Size</span><span class="filter-plus" :class="{ expanded: allExpanded.size }"></span></button>
                <div v-if="allExpanded.size" class="filter-accordion-content">
                  <button v-for="size in sizeFilterOptions" :key="size" class="filter-choice-row" :aria-pressed="selectedSizes.includes(size)" @click="toggleSizeFilter(size)"><span>{{ size }}</span><span class="filter-checkbox" :class="{ checked: selectedSizes.includes(size) }"><ShopIcon v-if="selectedSizes.includes(size)" name="check" /></span></button>
                </div>
              </li>
              <li class="filter-section filter-section--gender" aria-label="Gender filter">
                <p class="filter-section-title">Gender</p>
                <label v-for="name in genderFilterOptions" :key="name" class="filter-radio-row"><span>{{ name }}</span><input v-model="selectedGender" name="all-gender" type="radio" :value="name" /></label>
              </li>
              <li class="filter-section filter-section--price" aria-label="Price filter">
                <p class="filter-section-title">Price</p>
                <div class="price-range" :style="priceRangeStyle"><span class="price-range-track"></span><input v-model.number="minimumPrice" aria-label="Decrease price" type="range" min="0" max="2000" step="25" @input="updateMinimumPrice(minimumPrice)" /><input v-model.number="maximumPrice" aria-label="Increase price" type="range" min="0" max="2000" step="25" @input="updateMaximumPrice(maximumPrice)" /></div>
                <div class="price-inputs"><label><span>$</span><input :value="minimumPrice" type="number" min="0" max="2000" aria-label="Minimum price" @change="updateMinimumPrice(Number(($event.target as HTMLInputElement).value))" /></label><i></i><label><span>$</span><input :value="maximumPrice >= 2000 ? '2000+' : maximumPrice" type="text" inputmode="numeric" placeholder="2000" aria-label="Maximum price" @change="updateMaximumPrice(Number(($event.target as HTMLInputElement).value.replace(/[^0-9]/g, '')))" /></label></div>
              </li>
              <li class="filter-section filter-section--ratings" aria-label="Ratings filter">
                <p class="filter-section-title">Ratings</p>
                <label v-for="option in ratingFilterOptions" :key="option.value" class="filter-radio-row"><span v-if="option.stars === 0">All ratings</span><span v-else class="rating-filter-stars"><span><ShopIcon v-for="star in 5" :key="star" name="star" :class="{ muted: star > option.stars }" /></span><b>&amp; Up</b></span><input v-model="selectedRating" name="all-rating" type="radio" :value="option.value" :aria-label="option.label" /></label>
              </li>
              <li class="filter-section filter-section--shipping" aria-label="Ships to filter">
                <p class="filter-section-title">Ships to <span>{{ shippingCode(selectedCountry) }}</span></p>
                <label class="country-select"><span>{{ selectedCountry || 'Select a country' }}</span><select v-model="selectedCountry" aria-label="Select a country"><option value="">Select a country</option><option v-for="country in countries" :key="country" :value="country">{{ country }}</option></select><ShopIcon name="chevron-right" /></label>
                <button class="address-signin" @click="activateNav('login')">Sign in to see your addresses</button>
              </li>
              <li v-for="quickFilter in ['Sells from', 'On sale', 'In-stock']" :key="quickFilter" class="filter-section filter-section--switch"><span>{{ quickFilter === 'Sells from' ? 'Sells from 🇭🇰' : quickFilter }}</span><button role="switch" :aria-checked="activeQuickFilters.includes(quickFilter)" :aria-label="quickFilter" @click="toggleQuickFilter(quickFilter)"><i></i></button></li>
            </ul>
            <div class="filter-actions filter-actions--drawer"><button @click="resetFilters">Reset</button><button @click="closeFilter">Done</button></div>
          </template>

          <template v-else>
            <div class="filter-options" :class="`filter-options--${filterPanel}`">
              <template v-if="filterPanel === 'category'">
                <label class="filter-radio-row category-radio-row"><span>All categories</span><input v-model="selectedCategoryFilter" name="category" type="radio" value="All categories" aria-label="All categories" /></label>
                <template v-for="name in categoryFilterOptions.slice(1)" :key="name">
                  <label v-if="name === 'Luggage & bags'" class="filter-radio-row category-radio-row"><span>{{ name }}</span><input v-model="selectedCategoryFilter" name="category" type="radio" :value="name" :aria-label="name" /></label>
                  <button v-else class="filter-choice-row category-choice-row" :class="{ selected: selectedCategoryFilter === name }" :aria-label="`Expand ${name} category`" @click="selectCategoryFilter(name)"><span>{{ name }}</span><ShopIcon name="chevron-right" /></button>
                </template>
              </template>
              <template v-else-if="filterPanel === 'ratings'">
                <label v-for="option in ratingFilterOptions" :key="option.value" class="filter-radio-row"><span v-if="option.stars === 0">All ratings</span><span v-else class="rating-filter-stars"><span><ShopIcon v-for="star in 5" :key="star" name="star" :class="{ muted: star > option.stars }" /></span><b>&amp; Up</b></span><input v-model="selectedRating" name="rating" type="radio" :value="option.value" :aria-label="option.label" /></label>
              </template>
              <template v-else-if="filterPanel === 'gender'">
                <label v-for="name in genderFilterOptions" :key="name" class="filter-radio-row"><span>{{ name }}</span><input v-model="selectedGender" name="gender" type="radio" :value="name" /></label>
              </template>
              <template v-else-if="filterPanel === 'shipping'">
                <label class="country-select"><span>{{ selectedCountry || 'Select a country' }}</span><select v-model="selectedCountry" aria-label="Select a country"><option value="">Select a country</option><option v-for="country in countries" :key="country" :value="country">{{ country }}</option></select><ShopIcon name="chevron-right" /></label>
                <button class="address-signin" @click="activateNav('login')">Sign in to see your addresses</button>
              </template>
              <template v-else-if="filterPanel === 'size'">
                <button v-for="size in sizeFilterOptions" :key="size" class="filter-choice-row" :aria-pressed="selectedSizes.includes(size)" @click="toggleSizeFilter(size)"><span>{{ size }}</span><span class="filter-checkbox" :class="{ checked: selectedSizes.includes(size) }"><ShopIcon v-if="selectedSizes.includes(size)" name="check" /></span></button>
              </template>
              <template v-else-if="filterPanel === 'color'">
                <button v-for="option in colorFilterOptions" :key="option.name" class="filter-choice-row filter-color-row" :aria-pressed="selectedColors.includes(option.name)" @click="toggleColorFilter(option.name)"><span class="color-swatch" :style="{ backgroundColor: option.color }"></span><span>{{ option.name }}</span><span class="filter-checkbox" :class="{ checked: selectedColors.includes(option.name) }"><ShopIcon v-if="selectedColors.includes(option.name)" name="check" /></span></button>
              </template>
              <template v-else-if="filterPanel === 'price'">
                <div class="price-range" :style="priceRangeStyle"><span class="price-range-track"></span><input v-model.number="minimumPrice" aria-label="Decrease price" type="range" min="0" max="2000" step="25" @input="updateMinimumPrice(minimumPrice)" /><input v-model.number="maximumPrice" aria-label="Increase price" type="range" min="0" max="2000" step="25" @input="updateMaximumPrice(maximumPrice)" /></div>
                <div class="price-inputs"><label><span>$</span><input :value="minimumPrice" type="number" min="0" max="2000" aria-label="Minimum price" @change="updateMinimumPrice(Number(($event.target as HTMLInputElement).value))" /></label><i></i><label><span>$</span><input :value="maximumPrice >= 2000 ? '2000+' : maximumPrice" type="text" inputmode="numeric" placeholder="2000" aria-label="Maximum price" @change="updateMaximumPrice(Number(($event.target as HTMLInputElement).value.replace(/[^0-9]/g, '')))" /></label></div>
              </template>
              <template v-else-if="filterPanel === 'sort'">
                <label v-for="name in sortFilterOptions" :key="name" class="filter-radio-row"><span>{{ name }}</span><input v-model="selectedSort" name="sort" type="radio" :value="name" /></label>
              </template>
            </div>
            <div class="filter-actions"><button @click="resetFilters">Reset</button><button @click="closeFilter">Done</button></div>
          </template>
        </section>
      </section>
    </main>

    <div v-if="shareToastMessage" class="share-toast" role="status" aria-live="polite">{{ shareToastMessage }}</div>

    <Transition name="sticky-search"><button v-if="route !== 'home' || isStickySearchVisible" class="sticky-search" :class="{ 'is-expanded': searchOpen && searchOrigin === 'sticky' }" type="button" aria-label="Search products and stores" :inert="hasOpenDialog" @click="openSearch"><span>{{ query || 'What are you shopping for today?' }}</span><ShopIcon class="sticky-arrow" name="arrow-right" /><ShopIcon class="sticky-magnifier" name="search" /></button></Transition>

    <nav v-if="!historyOpen" class="mobile-nav" aria-label="Mobile navigation" :inert="hasOpenDialog">
      <button aria-label="Home" :class="{ 'is-active': navActive === 'home' }" @click="activateNav('home')"><ShopIcon name="home" /></button>
      <button aria-label="Explore" :class="{ 'is-active': navActive === 'categories' }" @click="activateNav('categories')"><ShopIcon name="grid" /></button>
      <button aria-label="View Cart" :class="{ 'is-active': navActive === 'cart' }" @click="activateNav('cart')"><ShopIcon name="cart" /></button>
      <button aria-label="Deals" :class="{ 'is-active': navActive === 'offers' }" @click="activateNav('offers')"><ShopIcon name="tag" /></button>
      <button aria-label="Sign in" @click="activateNav('login')"><ShopIcon name="profile" /></button>
    </nav>

    <button v-if="searchOpen" class="desktop-search-dismiss" aria-label="Close search" @click="closeSearch"></button>
    <Transition name="search-expand">
      <section v-if="searchOpen" ref="searchLayer" class="search-layer" :class="{ 'search-layer--home': searchOrigin === 'hero', 'search-layer--sticky': searchOrigin === 'sticky' }" :style="{ '--search-top': searchAnchor.top, '--search-left': searchAnchor.left }" role="dialog" aria-modal="true" aria-label="Search products and stores" tabindex="-1">
        <div class="mobile-search-actions"><button aria-label="Search history" @click="showHistory"><ShopIcon name="history" /></button><button aria-label="Close search" @click="closeSearch"><ShopIcon name="close" /></button></div>
        <form class="search-form" @submit.prevent="runSearch()"><button type="button" class="search-camera" aria-label="Attach image" @click="fileInput?.click()"><ShopIcon name="camera" /></button><span v-if="attachedImage" class="search-preview"><img :src="attachedImage" alt="Attached search" /><button type="button" aria-label="Remove image" @click="clearAttachedImage"><ShopIcon name="close" /></button></span><input ref="searchInput" v-model="searchDraft" type="search" autocomplete="off" aria-label="Search products and stores" /><button type="submit" class="search-go" aria-label="Search"><ShopIcon name="arrow-right" /></button></form>
        <div class="search-suggestions"><span>Suggestions</span><button v-for="suggestion in searchSuggestions" :key="suggestion" @click="runSearch(suggestion)"><ShopIcon name="arrow-down" /><span>{{ suggestion }}</span></button><a class="search-disclaimer" href="https://www.shopify.com/legal/privacy/consumers" target="_blank" rel="noreferrer">Learn more about how we use your data to personalize your experience. Recommendations are for informational purposes only.</a></div>
        <button class="desktop-history-button" aria-label="Search history" @click="showHistory"><ShopIcon name="history" /></button>
      </section>
    </Transition>

    <button v-if="historyOpen" class="history-dismiss" aria-label="Close search history" @click="closeHistory"></button>
    <section v-if="historyOpen" ref="historyLayer" class="history-layer" role="dialog" aria-modal="true" aria-label="Search history" tabindex="-1"><button class="history-close" aria-label="Close" @click="closeHistory"><ShopIcon name="close" /></button><h2>Search history</h2><div v-if="searchHistory.length" class="history-list"><button v-for="item in searchHistory" :key="item.query" @click="runSearch(item.query)"><span class="history-agent"><ShopIcon name="agent" /></span><span><strong>{{ item.query }}</strong><small>{{ formatHistoryAge(item.searchedAt) }}</small></span></button></div><p v-else class="history-empty">Your searches will appear here.</p></section>

    <input ref="fileInput" class="visually-hidden" type="file" accept="image/*" @change="attachImage" />
  </template>
</template>
