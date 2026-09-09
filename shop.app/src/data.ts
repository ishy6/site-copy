export type CategoryItem = {
  name: string
  image: string
}

export type CategoryGroup = {
  name: string
  slug: string
  chipImage: string
  items: CategoryItem[]
}

export type BrandCard = {
  name: string
  rating: string
  reviews: string
  cover: string
  logo?: string
  products: string[]
  invertLogo?: boolean
}

export type BrandSection = {
  title: string
  slug: string
  brands: BrandCard[]
}

const categoryBase = 'https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/'

export const categories: CategoryGroup[] = [
  {
    name: 'Women',
    slug: 'women',
    chipImage: `${categoryBase}20260326_1_L1_womenswear_pill.png?width=640`,
    items: [
      { name: 'Dresses', image: `${categoryBase}20260326_27_L2_womenswear_dresses.png?width=1000` },
      { name: 'Shirts', image: `${categoryBase}20260326_314_L3_womenswear_shirts_tops_shirts.png?width=1000` },
      { name: 'Sneakers', image: `${categoryBase}20260326_188_L3_womenswear_shoes_sneakers.png?width=1000` },
      { name: 'Pants', image: `${categoryBase}20260326_26_L2_womenswear_pants.png?width=1000` },
    ],
  },
  {
    name: 'Men',
    slug: 'men',
    chipImage: `${categoryBase}20260326_2_L1_menswear_pill.png?width=640`,
    items: [
      { name: 'Hoodies', image: `${categoryBase}20260326_318_L3_menswear_shirts_tops_hoodies.png?width=1000` },
      { name: 'Pants', image: `${categoryBase}20260326_17_L2_menswear_pants.png?width=1000` },
      { name: 'T-shirts', image: `${categoryBase}20260326_317_L3_menswear_shirts_tops_t_shirts.png?width=1000` },
      { name: 'Sneakers', image: `${categoryBase}20260326_205_L3_menswear_shoes_sneakers.png?width=1000` },
    ],
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    chipImage: `${categoryBase}20260326_5_L1_beauty_pill.png?width=640`,
    items: [
      { name: 'Lotion & moisturizer', image: `${categoryBase}20260326_55_L3_beauty_skin_care_lotion_moisturizer.png?width=1000` },
      { name: 'Hair styling products', image: `${categoryBase}20260326_206_L3_beauty_hair_care_hair_styling_products.png?width=1000` },
      { name: 'Anti-aging kits', image: `${categoryBase}20260326_59_L3_beauty_skin_care_anti_aging_kits.png?width=1000` },
      { name: 'Perfume & cologne', image: `${categoryBase}20260417_66_L2_beauty_perfume_cologne.png?width=1000` },
    ],
  },
  {
    name: 'Home',
    slug: 'home',
    chipImage: `${categoryBase}20260326_6_L1_home_pill.png?width=640`,
    items: [
      { name: 'Blankets', image: `${categoryBase}20260326_90_L3_home_bedding_blankets.png?width=1000` },
      { name: 'Rugs', image: `${categoryBase}20260326_77_L3_home_decor_rugs.png?width=1000` },
      { name: 'Home fragrances', image: `${categoryBase}20260417_79_L3_home_decor_home_fragrances.png?width=1000` },
      { name: 'Household appliances', image: `${categoryBase}20260326_95_L2_home_household_appliances.png?width=1000` },
    ],
  },
  {
    name: 'Fitness & nutrition',
    slug: 'fitness-nutrition',
    chipImage: `${categoryBase}20260326_69_L1_fitness_nutrition_pill.png?width=640`,
    items: [
      { name: 'Exercise equipment', image: `${categoryBase}20260326_250_L2_fitness_nutrition_exercise_equipment.png?width=1000` },
      { name: 'Supplements', image: `${categoryBase}20260326_242_L3_fitness_nutrition_vitamins_supplements_supplements.png?width=1000` },
      { name: 'Vitamins', image: `${categoryBase}20260326_241_L3_fitness_nutrition_vitamins_supplements_vitamins.png?width=1000` },
      { name: 'Drinks & shakes', image: `${categoryBase}20260326_246_L3_fitness_nutrition_nutrition_drinks_shakes.png?width=1000` },
    ],
  },
  {
    name: 'Baby & toddler',
    slug: 'baby-toddler',
    chipImage: `${categoryBase}20260326_209_L1_baby_toddler_pill.png?width=640`,
    items: [
      { name: 'Formula', image: `${categoryBase}20260326_219_L3_baby_toddler_nursing_feeding_formula.png?width=1000` },
      { name: 'Strollers & travel', image: `${categoryBase}20260326_225_L2_baby_toddler_strollers_travel.png?width=1000` },
      { name: 'Diapers', image: `${categoryBase}20260326_224_L2_baby_toddler_diapers.png?width=1000` },
      { name: 'Outfits', image: `${categoryBase}20260326_211_L3_baby_toddler_clothing_outfits.png?width=1000` },
    ],
  },
  {
    name: 'Food & drinks',
    slug: 'food-drinks',
    chipImage: `${categoryBase}20260326_251_L1_food_drinks_pill.png?width=640`,
    items: [
      { name: 'Coffee', image: `${categoryBase}20260326_252_L2_food_drinks_coffee.png?width=1000` },
      { name: 'Tea', image: `${categoryBase}20260326_253_L2_food_drinks_tea.png?width=1000` },
      { name: 'Candy & chocolate', image: `${categoryBase}20260417_254_L2_food_drinks_candy_chocolate.png?width=1000` },
      { name: 'Snacks', image: `${categoryBase}20260326_255_L2_food_drinks_snacks.png?width=1000` },
    ],
  },
]

export const heroImages = [
  '/assets/images/categories/beauty-1.webp',
  '/assets/images/categories/women-1.webp',
  '/assets/images/categories/home-1.webp',
  '/assets/images/categories/fitness-1.webp',
  '/assets/images/categories/men-1.webp',
  '/assets/images/categories/beauty-2.webp',
]

const supplementalBrands: Record<'baby' | 'beauty' | 'fitness' | 'food', BrandCard[]> = {
  baby: [
    {
      name: 'Gathre', rating: '4.7', reviews: '1607',
      cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/www-lets-playground-shopify-com.myshopify.com/1757699625/thumbnail.png?format=webp',
      logo: 'https://cdn.shopify.com/s/files/1/0692/5295/files/logo.png?v=1613510622&width=640',
      products: [
        'https://cdn.shopify.com/s/files/1/0692/5295/files/IMG_2003.jpg?v=1729625881&width=384',
        'https://cdn.shopify.com/s/files/1/0692/5295/files/lifestylemilletminimat-ec4f4678-84a2-4521-916e-0ba774d4d333.jpg?v=1712180561&width=384',
        'https://cdn.shopify.com/s/files/1/0692/5295/files/world-map-midi-circle-lifestyle-product-listing-c3f023c4-d6f1-4267-9bc1-bc984f268363.jpg?v=1712180272&width=384',
      ],
    },
    {
      name: 'Snapper Rock', rating: '4.8', reviews: '2104',
      cover: 'https://snapperrock.com/cdn/shop/files/snapper-rock-shopify.jpg?v=1755489355&width=1200',
      logo: 'https://snapperrock.com/cdn/shop/files/sr-logo-white-770x366.png?v=1723423966&width=640',
      products: [
        'https://snapperrock.com/cdn/shop/files/s26-mega-menu-jewelry.jpg?v=1768800072&width=384',
        'https://snapperrock.com/cdn/shop/files/teen-period-swim-menu-tile.jpg?v=1777336887&width=384',
        'https://snapperrock.com/cdn/shop/files/s26-mega-menu-girls-new-arrivals-drop2.jpg?v=1768800727&width=384',
      ],
    },
    {
      name: 'Solly Baby', rating: '4.9', reviews: '1.2万',
      cover: 'https://sollybaby.com/cdn/shop/files/PLP-Header-Cream_Houndstooth.png?v=1785190549&width=800',
      logo: 'https://sollybaby.com/cdn/shop/files/solly_logo_black_transparent_52175c67-3c6f-40e9-8e7c-d881f47fa1a6.png?v=1752605603&width=390',
      products: [
        'https://sollybaby.com/cdn/shop/files/PLP-Header-Bleu_Toile.png?v=1785190549&width=384',
        'https://sollybaby.com/cdn/shop/files/PLP-Header-Blush_Floret.png?v=1785190549&width=384',
        'https://sollybaby.com/cdn/shop/files/PLP-Header-Sage_Chequer.png?v=1785190549&width=384',
      ],
    },
    {
      name: 'Kyte Baby', rating: '4.9', reviews: '2.9万',
      cover: 'https://kytebaby.com/cdn/shop/files/Silly_Goose_in_Take_me_home_set-03.jpg?v=1757089459&width=1200',
      logo: 'https://kytebaby.com/cdn/shop/files/KB_logo_primary_black_1cf672fa-c667-4ca6-b57e-f27485d40f67.jpg?v=1744693289&width=640',
      products: [
        'https://kytebaby.com/cdn/shop/files/KB-Newborn-Shop.jpg?v=1787066153&width=384',
        'https://kytebaby.com/cdn/shop/files/KB-Character-Shop.jpg?v=1787066153&width=384',
        'https://kytebaby.com/cdn/shop/files/2_eca2cfde-c775-4ac3-b503-feaa70a6801b.png?v=1739509151&width=384',
      ],
    },
    {
      name: 'Posh Peanut', rating: '4.9', reviews: '4.6万',
      cover: 'https://poshpeanut.com/cdn/shop/files/End_of_Summer_Sale_P1_-_MB.png?v=1788368880&width=1200',
      logo: 'https://poshpeanut.com/cdn/shop/files/Logo_Posh_Peanut_Desktop_large.png?v=1749159063&width=640',
      products: [
        'https://poshpeanut.com/cdn/shop/files/The_Autumn_Edit_-_P1_-_MB_v2.jpg?v=1787764733&width=384',
        'https://poshpeanut.com/cdn/shop/files/Posh-O-Ween_-_P1_-_MB.jpg?v=1785944496&width=384',
        'https://poshpeanut.com/cdn/shop/files/Press_-_Motherly2_15c3fa91-a363-48be-99c7-74b5b1b11965.png?v=1697127799&width=384',
      ],
    },
    {
      name: 'Pehr', rating: '4.8', reviews: '4281',
      cover: 'https://pehr.com/cdn/shop/files/PehrFallCampaign-A-0079.jpg?crop=center&height=1200&v=1788498754&width=900',
      logo: 'https://pehr.com/cdn/shop/files/Pehr_Logo.png?v=1614315150&width=480',
      products: [
        'https://pehr.com/cdn/shop/files/5112489-longsleevetop-petalpress-6.jpg?crop=center&height=600&v=1788228932&width=480',
        'https://pehr.com/cdn/shop/files/Pehr-Rush-Printed-FT-A-0064.jpg?crop=center&height=600&v=1787542685&width=480',
        'https://pehr.com/cdn/shop/files/2001430-kimonoonepiece-baby-pindotpebble-3.jpg?crop=center&height=600&v=1755876152&width=480',
      ],
    },
  ],
  beauty: [
    {
      name: 'DedCool', rating: '4.8', reviews: '1.8万',
      cover: 'https://dedcool.com/cdn/shop/files/AlmostEverything_01_new_xm.jpg?v=1785556702&width=800',
      logo: 'https://dedcool.com/cdn/shop/files/logo.eca17dd_1.png?v=1772138992&width=640',
      products: [
        'https://dedcool.com/cdn/shop/files/XM_2_2.png?v=1758644543&width=384',
        'https://dedcool.com/cdn/shop/files/RL_XTRA_MILK_70c42d44-7369-411d-8366-a6947f3109e4.png?v=1779386071&width=384',
        'https://dedcool.com/cdn/shop/files/Balm_Marshmallow.png?v=1709146820&width=384',
      ],
    },
    {
      name: 'Hanacure', rating: '4.7', reviews: '9271',
      cover: 'https://www.hanacure.com/cdn/shop/files/image_1_3554f8ff-76ea-428e-809c-75e9969c6c20.png?v=1788386899&width=1000',
      logo: 'https://cdn.shopify.com/s/files/1/1080/2380/files/HC_logotype_v2_FN_5a46033a-53a0-497b-92a7-f1074f88d59b.jpg?v=1748997645&width=640',
      products: [
        'https://www.hanacure.com/cdn/shop/files/image_30d9daae-d7e9-4e91-8ca9-ad9d69876ece.png?v=1788386896&width=384',
        'https://www.hanacure.com/cdn/shop/files/fa0e8ce2-c685-488d-9c08-4b03c731e095_large_1_1_3707c625-8bc7-4fbe-ba90-7a5e4fb156a3.png?v=1718179032&width=384',
        'https://www.hanacure.com/cdn/shop/files/Group_50_1.png?v=1718178393&width=384',
      ],
    },
    {
      name: 'Soft Services', rating: '4.8', reviews: '5112',
      cover: 'https://cdn.sanity.io/images/etewgnzk/production/e75997bb82f3f1d45e88ca2738350b3ebc4573aa-1330x1080.gif?w=900',
      products: [
        'https://cdn.sanity.io/images/etewgnzk/production/2e97847c010dff2c55e4fb9eda7b25353b6da9ef-690x690.png?w=384&q=90&auto=format',
        'https://cdn.sanity.io/images/etewgnzk/production/023c2247029daf88924877231366c039d63907d7-690x690.png?w=384&q=90&auto=format',
        'https://cdn.sanity.io/images/etewgnzk/production/24c053e2f382922db292c3ab7f705188e9dc4673-1000x1000.png?w=384&q=90&auto=format',
      ],
    },
    {
      name: 'KITSCH', rating: '4.8', reviews: '14.5万',
      cover: 'https://www.mykitsch.com/cdn/shop/files/Kitsch-Summer-Welcome-Kit-CoconutOil-HairCatcher-1_d3c03d7e-ced0-4394-a6ac-11312dacef89.jpg?v=1787241476&width=1000',
      products: [
        'https://www.mykitsch.com/cdn/shop/files/1337-NoSnagElastics-Kitschpro-Black-hero-v3-1280x1280px.jpg?quality=75&v=1762182070&width=384',
        'https://www.mykitsch.com/cdn/shop/products/1412-KitschPro-essential_bobbyPins-blonde-pkg-2-1280x1280px.jpg?quality=75&v=1762182074&width=384',
        'https://www.mykitsch.com/cdn/shop/products/1399-KitschPro-essential_bobbyPin-black-pkg-2-1280x1280px.jpg?quality=75&v=1762182075&width=384',
      ],
    },
    {
      name: 'Rare Beauty', rating: '4.8', reviews: '18.9万',
      cover: 'https://www.rarebeauty.com/cdn/shop/files/share-image.jpg?format=pjpg&v=1613733998&width=1200',
      logo: 'https://customers.seomanager.com/knowledgegraph/logo/therarebeauty_myshopify_com_logo.jpg',
      products: [
        'https://www.rarebeauty.com/cdn/shop/files/GNAV-SU26-SHOP-ALL.png?v=1774669137&width=384',
        'https://www.rarebeauty.com/cdn/shop/files/LATE-FA26-NAVIGATION-NEW.png?v=1786106615&width=384',
        'https://www.rarebeauty.com/cdn/shop/files/GNAV-SU26-BESTSELLERS.png?v=1774669137&width=384',
      ],
    },
    {
      name: 'Glow Recipe', rating: '4.7', reviews: '20.1万',
      cover: 'https://www.glowrecipe.com/cdn/shop/files/8_10_LIP_BLUR_TEASER_HP_MOBILE_copy.jpg?v=1788486290&width=900',
      logo: 'https://www.glowrecipe.com/cdn/shop/files/GLOW_TYPOGRAPHIC_7152e569-f2c6-4c54-933b-679050cbfc81_600x.png?v=1633360446',
      products: [
        'https://www.glowrecipe.com/cdn/shop/files/LIPBLUR_INFOGRAPHIC_1_2000x2000-5.jpg?v=1786156594&width=384',
        'https://www.glowrecipe.com/cdn/shop/files/LIPBLUR_INFOGRAPHIC_2_2000x2000-5.jpg?v=1786156594&width=384',
        'https://www.glowrecipe.com/cdn/shop/files/10_23_24_BANANA_LIP_LAUNCH_PDP2.png?v=1729545607&width=384',
      ],
    },
  ],
  fitness: [
    {
      name: 'Black Girl Vitamins', rating: '4.9', reviews: '2.3万',
      cover: 'https://cdn.shopify.com/s/files/1/0580/6217/6407/files/Instagram_post_-_219.png?v=1695296860&width=1000',
      logo: 'https://cdn.shopify.com/s/files/1/0580/6217/6407/files/logojpeg_90x.jpg?v=1682937097&width=640',
      products: [
        'https://blackgirlvitamins.co/cdn/shop/files/1_bottle_1_720x_1.png?v=1774412789&width=384',
        'https://blackgirlvitamins.co/cdn/shop/files/1_bottle_3.png?v=1771009649&width=384',
        'https://blackgirlvitamins.co/cdn/shop/files/1_bottle_1.png?v=1762288280&width=384',
      ],
    },
    {
      name: 'Arrae', rating: '4.8', reviews: '1.9万',
      cover: 'https://www.arrae.com/cdn/shop/files/Banner_2dc36dc8-ff69-4fe2-ae90-53d97c1ea3ac.png?v=1786735261&width=1000',
      logo: 'https://www.arrae.com/cdn/shop/files/logo-white.svg?v=1784837439&width=640',
      products: [
        'https://www.arrae.com/cdn/shop/files/Frame_1538238845.png?v=1785244138&width=384',
        'https://www.arrae.com/cdn/shop/files/Frame_1538238844.png?v=1785244138&width=384',
        'https://www.arrae.com/cdn/shop/files/Frame_1538238843.png?v=1785244138&width=384',
      ],
    },
    {
      name: 'JOAH BROWN®', rating: '4.8', reviews: '1.4万',
      cover: 'https://cdn.shopify.com/s/files/1/0261/8853/files/social-image-jb.jpg?v=1686255044&width=1000',
      logo: 'https://www.joahbrown.com/cdn/shop/files/JOAHBROWN_BlurLogo_Black__CloserBrown_b3982dce-6c95-46bb-b2ce-de17d3fb7913.png?v=1787157757&width=640',
      products: [
        'https://www.joahbrown.com/cdn/shop/files/Joah-Brown-Ecomm-Film-Classic-Windbreaker-Jacket-Fawn-The-Official-Cap-Desert-018.jpg?v=1770927961&width=384',
        'https://www.joahbrown.com/cdn/shop/files/Joah-Brown-Film-Lifestyle-Classic-Crew-Tee-Moss-Brown-Classic-Windbreaker-Jacket-Espresso-29.jpg?v=1786133242&width=384',
        'https://www.joahbrown.com/cdn/shop/files/Homepage-Mobile-August-2026-v5.jpg?v=1786484868&width=384',
      ],
    },
    {
      name: 'SET ACTIVE', rating: '4.8', reviews: '3.2万',
      cover: 'https://setactive.co/cdn/shop/files/8.30-Nav_Aeraline.jpg?v=1788217977&width=1200',
      logo: 'https://setactive.co/cdn/shop/files/SET_LOGO-NEW_afccf305-3c44-4602-9916-d29ab285d5cf.png?v=1749497703&width=640',
      products: [
        'https://setactive.co/cdn/shop/files/2026_08_11_SET_0345.jpg?v=1787608392&width=384',
        'https://setactive.co/cdn/shop/files/2026_08_11_SET_0114.jpg?v=1787349811&width=384',
        'https://setactive.co/cdn/shop/files/2026_08_11_SET_0253.jpg?v=1787607916&width=384',
      ],
    },
    {
      name: 'The Feed', rating: '4.9', reviews: '5.4万',
      cover: 'https://cdn.shopify.com/s/files/1/1515/2714/files/homepage_og_1200x630.png?v=1727115010',
      logo: 'https://cdn.shopify.com/s/files/1/1515/2714/files/TheFeed_logo.png',
      products: [
        'https://res.cloudinary.com/thefeedcom/image/fetch/c_limit,w_500/f_auto/q_auto/v1/https://images.ctfassets.net/j3zdbjyb13bo/k0YvwEyzKsS4VBsw1I2eL/090d441b3394be6ddfee379a01a34da4/hp_feedsocks_1x1.png',
        'https://res.cloudinary.com/thefeedcom/image/fetch/c_limit,w_500/f_auto/q_auto/v1/https://images.ctfassets.net/j3zdbjyb13bo/4GA763APQ4QjbAfyj8bomL/53f589ba74f401ec34f9dcfb957c7d09/hp_sis_isotonics_9x16.png',
        'https://res.cloudinary.com/thefeedcom/image/fetch/c_limit,w_500/f_auto/q_auto/v1/https://images.ctfassets.net/j3zdbjyb13bo/weR2ZPilSEx9lCnhfB67U/c08c0d159d3e56f9fce48d3cab58daac/feedlab_hydration__Grid.png',
      ],
    },
    {
      name: 'POPFLEX®', rating: '4.8', reviews: '6.7万',
      cover: 'https://www.popflexactive.com/cdn/shop/files/b-desktop-hike_1.jpg?v=1788547704&width=1600',
      logo: 'https://www.popflexactive.com/cdn/shop/files/8.26.24-popflex-logo_0955e376-04b0-4a4b-9947-e9b25a162c07.png?v=1724700062&width=640',
      products: [
        'https://www.popflexactive.com/cdn/shop/files/PirouetteSkort-Peppercorn_01962-Edit.jpg?v=1757365896&width=384',
        'https://www.popflexactive.com/cdn/shop/files/PirouetteSkort-Peppercorn_02006-Edit.jpg?v=1757365896&width=384',
        'https://www.popflexactive.com/cdn/shop/files/a-homepage-gwtf.jpg?v=1788364568&width=384',
      ],
    },
  ],
  food: [
    {
      name: 'Kettl', rating: '4.9', reviews: '4851',
      cover: 'https://kettl.co/cdn/shop/files/Matcha_collection_card_03bb232c-ce6f-4307-aa7e-f86404ea786a.jpg?v=1762805804&width=1000',
      logo: 'https://kettl.co/cdn/shop/files/Kettl_logo_black.svg?v=1763474613&width=640',
      products: [
        'https://kettl.co/cdn/shop/files/Loose_tea_collection_card.jpg?v=1762805325&width=384',
        'https://kettl.co/cdn/shop/files/Tea_bag_collection_card.jpg?v=1762805866&width=384',
        'https://kettl.co/cdn/shop/files/Ceramics_collection_card.jpg?v=1762804421&width=384',
      ],
    },
    {
      name: "rocky's matcha", rating: '4.9', reviews: '1738',
      cover: 'https://www.rockysmatcha.com/cdn/shop/files/HOMEPAGE-260428_Rockys_matcha_272.jpg?v=1781757666&width=1600',
      products: [
        'https://www.rockysmatcha.com/cdn/shop/files/chris_bain_for_rm_web--MATCHAGLASS-1-LARGE_e168f858-b17c-43f0-b465-2b42c0eb2c47.jpg?crop=center&height=700&v=1751970199&width=500',
        'https://www.rockysmatcha.com/cdn/shop/files/RM_Scene10_AllTins_Stack_0292-web_8c7f49aa-4563-434e-864a-dca5d1931924.jpg?crop=center&height=700&v=1751970199&width=500',
        'https://www.rockysmatcha.com/cdn/shop/files/chris_bain_for_rm_web-2-Seethru_d51ee720-1540-4346-9d7a-1243662cdb39.jpg?crop=center&height=700&v=1751970199&width=500',
      ],
    },
  ],
}

export const brandSections: BrandSection[] = [
  {
    title: 'Baby & toddler',
    slug: 'baby-toddler-stores',
    brands: [
      {
        name: 'cuddle+kind', rating: '4.9', reviews: '3.5万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/cuddle-and-kind-us.myshopify.com/1775505812/ShopAppCoverImage.webp?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/cuddle-and-kind-us.myshopify.com/1707178093/cuddlekindhorizontallogowhite.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0030/8376/3824/files/01_Babykitten_withpumpkin.webp?v=1785374524&width=384',
          'https://cdn.shopify.com/s/files/1/0030/8376/3824/files/01_Babyghost_withbat.webp?v=1785375233&width=384',
          'https://cdn.shopify.com/s/files/1/0030/8376/3824/files/01_Babybat_fuzzycharcoal.webp?v=1785375296&width=384',
        ],
      },
      {
        name: 'KicKee Pants', rating: '4.9', reviews: '7499',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/kickeepants.myshopify.com/1736549278/KickeePantsSpring-216.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/kickeepants.myshopify.com/1687824898/KICKEEWt.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0635/3423/5886/files/NTE1MzA0MzUzMTI3.jpg?v=1756997564&width=384',
          'https://cdn.shopify.com/s/files/1/0635/3423/5886/files/NzQyMDAzMDc2MjU_8a4a0b5e-8318-4fcf-bcd5-2862cb76b346.jpg?v=1756997883&width=384',
          'https://cdn.shopify.com/s/files/1/0635/3423/5886/files/NTcxMDAyNDY4NTM.jpg?v=1756997761&width=384',
        ],
      },
      {
        name: 'WildBird', rating: '4.8', reviews: '8742',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/mywildbird.myshopify.com/1741733573/wildbird_carrier_-510.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/mywildbird.myshopify.com/1761246168/WildBird_Sparrow.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/3040/7690/files/1.acadian-wrap-1.jpg?v=1764003592&width=384',
          'https://cdn.shopify.com/s/files/1/3040/7690/files/01.FlutterWrap.jpg?v=1784559789&width=384',
          'https://cdn.shopify.com/s/files/1/3040/7690/files/1.desert-lark-wrap-1.jpg?v=1764004060&width=384',
        ],
      },
      {
        name: 'Busy Baby', rating: '4.9', reviews: '3604',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/busy-baby-mat.myshopify.com/1760548305/Kristareynoldsphotography-3901.jpeg?width=800&crop=region&crop_left=0&crop_top=542&crop_width=1067&crop_height=1057',
        logo: 'https://cdn.shopify.com/s/files/1/0044/5251/5913/files/Busy_Baby_Final_Logos-19.png?v=1695755390&width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0044/5251/5913/files/Menu_Slide_Spearmint_GB.png?v=1762008040&width=384',
          'https://cdn.shopify.com/s/files/1/0044/5251/5913/files/FeedingCollection.png?v=1762440248&width=384',
          'https://cdn.shopify.com/s/files/1/0044/5251/5913/files/0001-3869075268493081089.png?v=1762004649&width=384',
        ],
      },
      ...supplementalBrands.baby,
    ],
  },
  {
    title: 'Beauty',
    slug: 'beauty-stores',
    brands: [
      {
        name: 'Laura Geller Beauty', rating: '4.4', reviews: '34.1万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/laurageller.myshopify.com/1721763248/Untitleddesign-13.png?crop=region&crop_left=364&crop_top=0&crop_width=557&crop_height=506&width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/laurageller.myshopify.com/logo_1678822855.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0024/1618/1294/files/Laura_Geller_Balance-n-Brighten_Soldier-Ecomm_Porcelain_c22a3628-52e5-4bad-af6a-c9e0f1cbc62b_1.jpg?v=1785510243&width=384',
          'https://cdn.shopify.com/s/files/1/0024/1618/1294/files/Laura_Geller_Jelly_Balm_Soldier-Ecomm_Brick_House.jpg?v=1755010156&width=384',
          'https://cdn.shopify.com/s/files/1/0024/1618/1294/files/Laura_Geller_Double_Take_Baked_Soldier-Ecomm_Tan_0fbc2ce3-101f-4829-b024-57bd4081b3b4.jpg?v=1753906980&width=384',
        ],
      },
      {
        name: 'RMS Beauty', rating: '4.6', reviews: '7.5万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/rms-beauty.myshopify.com/1747951568/thumbnail.png?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/rms-beauty.myshopify.com/1706848043/RMSLOGOWHITE1.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0642/6399/files/eyelights-ppage-900x1084-flare-pack_2x_5cab6ee1-121b-4c70-a3ec-b3b02b0962e0.jpg?v=1760959997&width=384',
          'https://cdn.shopify.com/s/files/1/0642/6399/files/810170741685-chameleon-lip-oil-pack-shot-900x1084_.com.jpg?v=1776298798&width=384',
          'https://cdn.shopify.com/s/files/1/0642/6399/products/LEGLIP-PPAGE-900x1084-Pack-Mickey_2x_90afcc3b-6487-4d24-808f-29c998fedd80.jpg?v=1776169890&width=384',
        ],
      },
      {
        name: 'Lashify', rating: '4.5', reviews: '2.7万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/lashifyusa.myshopify.com/1762840301/Screenshot2025-11-10at95127PM.png?width=800&crop=region&crop_left=547&crop_top=73&crop_width=757&crop_height=475',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/lashifyusa.myshopify.com/logo_1680225977.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/1832/9335/files/Plushy_-_P14A_-_With_Cluster.jpg?v=1762457173&width=384',
          'https://cdn.shopify.com/s/files/1/1832/9335/files/Starburst_cartrge_lash_PDP-min.jpg?v=1762457176&width=384',
          'https://cdn.shopify.com/s/files/1/1832/9335/files/AmplifyV214-PDPWebsite-1200x1200-1.png?v=1772566869&width=384',
        ],
      },
      {
        name: 'Dieux', rating: '4.8', reviews: '1.1万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/dieux-skin.myshopify.com/1741704876/bg.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/dieux-skin.myshopify.com/1741704870/dieuxlogo.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0291/1449/9165/files/01_InstantAngel_50ml_D2CPDP_3e2d527b-b798-4bbf-b654-9b26fb9c5d53.png?v=1787942265&width=384',
          'https://cdn.shopify.com/s/files/1/0291/1449/9165/files/01_AirAngel_50ml_D2CPDP_c367df44-821e-4976-a332-6d0a1280d6e6.jpg?v=1779057556&width=384',
          'https://cdn.shopify.com/s/files/1/0291/1449/9165/files/1_30mL_2ff45d4f-07b7-4847-8cbe-5b579acbf7d5.png?v=1787942160&width=384',
        ],
      },
      ...supplementalBrands.beauty,
    ],
  },
  {
    title: 'Fitness & nutrition',
    slug: 'fitness-stores',
    brands: [
      {
        name: 'YoungLA', rating: '4.9', reviews: '38.9万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/youngla.myshopify.com/1780513376/Untitleddesign.png.png?width=800',
        logo: 'https://cdn.shopify.com/s/files/1/1775/6429/files/spaced_logo_white.png?v=1615829767&width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/1775/6429/files/YLA7.21.26D8-27BATMANCAVE_SOCIAL_056.jpg?v=1786405084&width=384',
          'https://cdn.shopify.com/s/files/1/1775/6429/files/2111_black-wash_002_11_26_rudy_ecomm_61ab94dd-770a-4cd6-87dc-be0d64433b1f.jpg?v=1731624193&width=384',
          'https://cdn.shopify.com/s/files/1/1775/6429/files/YLA7.21.26D8-27BATMANCAVE_FULLRES_090.jpg?v=1787858643&width=384',
        ],
      },
      {
        name: 'BodyHealth.com LLC', rating: '4.8', reviews: '7.3万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/bodyhealth-com.myshopify.com/1739400303/bodybg.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/bodyhealth-com.myshopify.com/1739463773/bodyhealthlogo.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0835/8481/files/PerfectAminoUncoatedTabletsMix.png?v=1788536633&width=384',
          'https://cdn.shopify.com/s/files/1/0835/8481/files/PerfectAmino_Powder_Fam_2_1_1.jpg?v=1756142409&width=384',
          'https://cdn.shopify.com/s/files/1/0835/8481/files/Electrolytes_FAM_1_1.jpg?v=1756142359&width=384',
        ],
      },
      {
        name: 'nuuds', rating: '4.8', reviews: '6.3万',
        cover: 'https://cdn.shopify.com/s/files/1/0654/5565/3115/files/preview_images/ea965da7a38b49a18f26a5923e1a482f.thumbnail.0000000000.jpg?v=1758901577&width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/nuuds-com.myshopify.com/1763055255/KP_NUUDS_WORDMARK_RGB_WHITE.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0654/5565/3115/files/Gen1_W-028-BLAC-S_On-Model_Front-Crop_victoria_6b349c2b-0b94-42d2-9650-2b56f744b5a6.jpg?v=1765320425&width=384',
          'https://cdn.shopify.com/s/files/1/0654/5565/3115/files/W-1734-LIWT_Side-Crop.png?v=1783536074&width=384',
          'https://cdn.shopify.com/s/files/1/0654/5565/3115/files/W-1568-JUNE_On_Model_0634_Front_Full.jpg?v=1776695536&width=384',
        ],
      },
      {
        name: 'Bare Performance Nutrition', rating: '4.9', reviews: '3.3万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/bare-performance-nutrition.myshopify.com/1696529077/hybridsupplements.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/bare-performance-nutrition.myshopify.com/1712935264/BPNstandard_white-01.png?crop=region&crop_left=0&crop_top=98&crop_width=900&crop_height=394&width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/1103/4864/files/CREATINE_60SV_Render_V01.png?v=1786117372&width=384',
          'https://cdn.shopify.com/s/files/1/1103/4864/files/WHEY_PROTEIN_Vanilla_Render_V01_BPNWPC-VN-9.png?v=1784150924&width=384',
          'https://cdn.shopify.com/s/files/1/1103/4864/files/GEL-AC-BOX-4_RENDER.jpg?v=1772551716&width=384',
        ],
      },
      ...supplementalBrands.fitness,
    ],
  },
  {
    title: 'Food & drinks',
    slug: 'food-stores',
    brands: [
      {
        name: 'Chamberlain Coffee - US', rating: '4.7', reviews: '2.3万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/chamberlaincoffee.myshopify.com/1730992001/chamberlaincoffeebg.png?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/chamberlaincoffee.myshopify.com/1701130775/CamberlainCoffeeLogoWHITERGB.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0424/8862/7355/files/OriginalMatcha_PDP_2048px_05_b48b9b3d-4315-4f50-878c-aebd96bd57d7.png?v=1765248884&width=384',
          'https://cdn.shopify.com/s/files/1/0424/8862/7355/files/GroundMediumUS_PDP_2048px_01_19b14e9f-d449-40fa-ad2a-5c821930ddef.png?v=1740780819&width=384',
          'https://cdn.shopify.com/s/files/1/0424/8862/7355/files/Ground_Espresso_US_PDP_2048px_01_74a0df19-f029-4f59-b37c-2cb4d52d1f62.png?v=1776723991&width=384',
        ],
      },
      {
        name: 'Flamingo Estate', rating: '4.8', reviews: '2万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/flamingo-estate-organics.myshopify.com/1774622562/Home.jpeg?width=800',
        logo: 'https://cdn.shopify.com/s/files/1/0062/8670/4730/files/fe-arpu-footer-logo.png?v=1635289064&width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0062/8670/4730/files/Tomato_Candle_Front_8oz_35c207ac-da46-47bc-91c4-c545072c0e88.png?v=1774383241&width=384',
          'https://cdn.shopify.com/s/files/1/0062/8670/4730/files/Peppermint_Soap_Brick_Front_80395f59-31aa-4751-9333-956ee20940fc.png?v=1761932478&width=384',
          'https://cdn.shopify.com/s/files/1/0062/8670/4730/files/SapphoFigCandle_Front_8oz.png?v=1783002051&width=384',
        ],
      },
      {
        name: 'Onyx Coffee Lab', rating: '4.9', reviews: '5992',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/onyx-coffee.myshopify.com/1727372873/2024Boxes00442.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/onyx-coffee.myshopify.com/1727372724/White_Logo.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/1707/3261/files/monarch-8-10-26.webp?v=1786377610&width=384',
          'https://cdn.shopify.com/s/files/1/1707/3261/files/southernweather.webp?v=1736189959&width=384',
          'https://cdn.shopify.com/s/files/1/1707/3261/files/geometry-10oz-v2.webp?v=1785978501&width=384',
        ],
      },
      {
        name: "Mike's Hot Honey", rating: '4.8', reviews: '182',
        cover: 'https://cdn.shopify.com/s/files/1/0738/6875/products/Margherita_Pizza_12oz_24oz_Gallon_GB_608_3b5cb832-3066-4783-b790-86be39cced2d.jpg?v=1598889547&width=800',
        logo: 'https://cdn.shopify.com/s/files/1/0738/6875/products/1233_88A2049.jpg?v=1620069730&width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0738/6875/products/Combo12oz.jpg?v=1620069730&width=384',
          'https://cdn.shopify.com/s/files/1/0738/6875/products/Combo12ozExh12oz_best_7ca02b01-db9a-4237-b061-d82b9450906a.jpg?v=1635193217&width=384',
          'https://cdn.shopify.com/s/files/1/0738/6875/files/Original_-_Front_-_no_color.jpg?v=1741670980&width=384',
        ],
      },
      ...supplementalBrands.food,
    ],
  },
  {
    title: 'Home',
    slug: 'home-stores',
    brands: [
      {
        name: 'Fellow', rating: '4.6', reviews: '1.9万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/fellow-products.myshopify.com/1763501765/112025_Web_HP_HeroSaleLaunch_MobileLarge.jpeg?width=800&crop=region&crop_left=0&crop_top=1109&crop_width=2000&crop_height=1647',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/fellow-products.myshopify.com/1773448876/FELLOW_LOGO_WHITE.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0057/6235/1219/products/Stagg-Paper-Filter-01-X-02.png?v=1757441397&width=384',
          'https://cdn.shopify.com/s/files/1/0057/6235/1219/files/Web_PDP_StaggEKGElectricKettle-Pro_Woodland_Walnut_1.png?v=1773351258&width=384',
          'https://cdn.shopify.com/s/files/1/0057/6235/1219/files/Web_PDP_CarterMoveMug-16oz_Sienna_2.png?v=1774035954&width=384',
        ],
      },
      {
        name: 'The Citizenry', rating: '4.6', reviews: '1万',
        cover: 'https://cdn.shopify.com/s/files/1/0438/1069/files/shop_app_fall_2024.001.jpg?v=1727361122&width=800',
        logo: 'https://cdn.shopify.com/s/files/1/0438/1069/files/logo_832x66_lightRetina.png?v=1613147205&width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0438/1069/files/CZ_Linen_Bedding_French_Blue_01_Sheet_Set_e872ba82-953b-4ecd-a0e7-93e2dfee5509.jpg?v=1776470016&width=384',
          'https://cdn.shopify.com/s/files/1/0438/1069/products/Imabari_Waffle_Towel_Indigo_2.jpg?v=1656117959&width=384',
          'https://cdn.shopify.com/s/files/1/0438/1069/files/CZ_Linen_Bedding_French_Blue_05_Duvet_f143e557-f0bb-48dc-8b65-01c08cc3cea0.jpg?v=1776470007&width=384',
        ],
      },
      {
        name: 'Revival Rugs', rating: '4.7', reviews: '1.5万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/revival-rugs.myshopify.com/1739445592/COVER-OPTION-01_1675.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/revival-rugs.myshopify.com/1739445428/rr-logo_white.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/1718/8557/files/1-RP3X5-1ove-premium-rug-pad_f9ba76d5-8b46-46a3-be3d-15577e37153e.jpg?v=1726527008&width=384',
          'https://cdn.shopify.com/s/files/1/1718/8557/files/low-pro-1-ove-ST-RP-edited.jpg?v=1787146801&width=384',
          'https://cdn.shopify.com/s/files/1/1718/8557/files/MNSR13SHLBC-6context_13395513-ebf1-4bd7-96fa-3b6d5bbefabf.jpg?v=1787074080&width=384',
        ],
      },
      {
        name: 'Hotel Collection', rating: '3.9', reviews: '1.2万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/hotelcollection.myshopify.com/1726688328/thumbnail.png?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/hotelcollection.myshopify.com/1726688445/WhiteDotLogo.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0399/6457/3862/files/PRO_POD_MY_WAY_NO_SHADOW_copy.png?v=1755543212&width=384',
          'https://cdn.shopify.com/s/files/1/0399/6457/3862/products/CarDiffuserBottlecentered.png?v=1679678516&width=384',
          'https://cdn.shopify.com/s/files/1/0399/6457/3862/files/PRO_POD_CABANA_NO_SHADOW_copy.png?v=1757433870&width=384',
        ],
      },
    ],
  },
  {
    title: 'Men',
    slug: 'men-stores',
    brands: [
      {
        name: 'OluKai', rating: '4.7', reviews: '3万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/olukai-store.myshopify.com/1717701620/ShopOluKai.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/olukai-store.myshopify.com/1702509711/OluKaiLogoVerticalOffWhite.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0015/9229/5523/products/10465_3333_001_M_Tuahine_TofTof.png?v=1762273277&width=384',
          'https://cdn.shopify.com/s/files/1/0015/9229/5523/products/10110_4827_001_M_Ohana_DarkJava.png?v=1762272514&width=384',
          'https://cdn.shopify.com/s/files/1/0015/9229/5523/files/10110_CX48_001_M_Ohana_CamoDarkJava.png?v=1782724623&width=384',
        ],
      },
      {
        name: 'Oneness Boutique', rating: '4.8', reviews: '6904',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/oneness287-2.myshopify.com/1753128265/74DA467F-0C1E-4608-9C2C-B24375AE1E17.jpeg?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/oneness287-2.myshopify.com/1730912650/onenesslogo.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/0187/5180/files/alt_01_lighter_9c0de9e6-0127-46a6-b94d-ed5a95907c63.jpg?v=1786753703&width=384',
          'https://cdn.shopify.com/s/files/1/0187/5180/files/oneness-nike-air-max-95-big-bubble-premium-in-anthracite-solar-black-grey-red-iv6425-060-01-lead-lateral.jpg?v=1782329732&width=384',
          'https://cdn.shopify.com/s/files/1/0187/5180/files/oneness-nike-book-2-must-be-the-denim-01.jpg?v=1784364266&width=384',
        ],
      },
      {
        name: 'Bather.com', rating: '4.6', reviews: '207',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/bather-2.myshopify.com/1775572075/251024000009260002_Large_63cd61e3-92e6-478f-96a8-8529192d9146.jpeg?crop=region&crop_left=0&crop_top=230&crop_width=1044&crop_height=1049&width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/bather-2.myshopify.com/1774275116/WORDMARKWHITE.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/1210/3516/files/SOLID_NAVY_SWIM_TRUNK_SS26.jpg?v=1774286788&width=384',
          'https://cdn.shopify.com/s/files/1/1210/3516/files/SOLID_PINE_SWIM_TRUNK_SS26.jpg?v=1774286867&width=384',
          'https://cdn.shopify.com/s/files/1/1210/3516/files/Solid-Olive-Swim.jpg?v=1762457242&width=384',
        ],
      },
      {
        name: 'JAXXON', rating: '4.8', reviews: '9万',
        cover: 'https://cdn.shopify.com/shop-assets/shopify_brokers/jaxxon-co.myshopify.com/1760570125/ShopAppBanner1.png?width=800',
        logo: 'https://cdn.shopify.com/shop-assets/shopify_brokers/jaxxon-co.myshopify.com/logo_1682351598.png?width=640',
        products: [
          'https://cdn.shopify.com/s/files/1/2417/4137/files/Cuban_Link_Chain_8mm_Gold_View1_Shopify_Tall_6c794558-72dc-4e40-b622-b2c758a49dd6.jpg?v=1783030687&width=384',
          'https://cdn.shopify.com/s/files/1/2417/4137/files/Cuban_Link_Chain_5mm_Gold_View1_Shopify_Tall_c81e9a4f-2dad-4c10-bec4-65eb1b7dc875.jpg?v=1783031949&width=384',
          'https://cdn.shopify.com/s/files/1/2417/4137/files/Gift_Wrap_Ecomm_1.jpg?v=1783031949&width=384',
        ],
      },
    ],
  },
]

export const suggestedSearches = [
  'Gifts for a friend who loves hosting dinner parties',
  'K-beauty skincare for sensitive skin',
  'Storage and organization solutions for small spaces',
]

export const footerGroups = [
  {
    title: 'Start selling',
    links: [
      { label: 'For brands', href: 'https://www.shopify.com/shop?utm_medium=website&utm_source=shop-website&utm_campaign=shop_app_footer_for_brands' },
      { label: 'For creators', href: 'https://www.shopify.com/collabs/creators?utm_medium=website&utm_source=shop-website&utm_campaign=shop_app_footer_for_creators' },
      { label: 'Build your store', href: 'https://www.shopify.com/free-trial?utm_medium=website&utm_source=shop-website&utm_campaign=shop_app_footer_build_your_store' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'Shop Pay', href: 'https://shop.app/shop-pay?utm_medium=website&utm_source=shop-website' },
      { label: 'Help center', href: 'https://help.shop.app/shop?utm_medium=website&utm_source=shop-website' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'X (Twitter)', href: 'https://twitter.com/shop?utm_medium=website&utm_source=shop-website' },
      { label: 'Instagram', href: 'https://instagram.com/shopapp?utm_medium=website&utm_source=shop-website' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: 'https://shop.app/terms-of-service' },
      { label: 'Privacy Policy', href: 'https://www.shopify.com/legal/privacy/app-users?utm_medium=website&utm_source=shop-website' },
      { label: 'Your Privacy Choices', href: 'https://privacy.shopify.com/?utm_medium=website&utm_source=shop-website' },
    ],
  },
]
