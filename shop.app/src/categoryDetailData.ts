import type { Product } from "./catalogData"

export type CategoryTopic = {
  name: string
  path: string
  image: string
}

export type CategoryEditorial = {
  title: string
  description: string
  image: string
  path: string
}

export type CategoryShelf = {
  title: string
  products: Product[]
}

export type CategoryDetail = {
  title: string
  path: string
  topics: CategoryTopic[]
  featuredCategories: CategoryTopic[]
  editorials: CategoryEditorial[]
  shelves: CategoryShelf[]
}

export const categoryDetails = {
  "food-drinks": {
    "title": "Food & Drinks",
    "path": "/categories/251/food-drinks",
    "topics": [
      {
        "name": "Coffee",
        "path": "/categories/252/coffee",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_252_L2_food_drinks_coffee_pill.png?format=webp"
      },
      {
        "name": "Pantry",
        "path": "/categories/293/pantry",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_293_L2_food_drinks_pantry_pill.png?format=webp"
      },
      {
        "name": "Snacks",
        "path": "/categories/255/snacks",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_255_L2_food_drinks_snacks_pill.png?format=webp"
      },
      {
        "name": "Tea",
        "path": "/categories/253/tea",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_253_L2_food_drinks_tea_pill.png?format=webp"
      },
      {
        "name": "Candy & chocolate",
        "path": "/categories/254/candy-chocolate",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_254_L2_food_drinks_candy_chocolate_pill.png?format=webp"
      }
    ],
    "featuredCategories": [
      {
        "name": "Coffee",
        "path": "/categories/252/coffee",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_252_L2_food_drinks_coffee.png?width=512"
      },
      {
        "name": "Tea",
        "path": "/categories/253/tea",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_253_L2_food_drinks_tea.png?width=512"
      },
      {
        "name": "Candy & chocolate",
        "path": "/categories/254/candy-chocolate",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260417_254_L2_food_drinks_candy_chocolate.png?width=512"
      },
      {
        "name": "Snacks",
        "path": "/categories/255/snacks",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_255_L2_food_drinks_snacks.png?width=512"
      }
    ],
    "editorials": [
      {
        "title": "Back-to-school breakfast",
        "description": "Pancake mixes, yogurt, and seed butters.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/miiyiqana61gcdyrcgeznx68qv64.jpg?width=1000",
        "path": "/categories/251/food-drinks/curation/01a000fb-8146-79d7-85aa-f0da3ca86061"
      },
      {
        "title": "Elevated sandwich essentials",
        "description": "Breads, pickles, and tinned fish.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/zxcd50g89rrixryqoqlj49fwndbi.jpg?width=1000",
        "path": "/categories/251/food-drinks/curation/019f7136-cd6f-714d-9dba-6cfb8cbb6de4"
      },
      {
        "title": "Hosting chips and dip night",
        "description": "Herby dips, scoop chips, and kettle classics.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/cjkqovf9iaxdta194reffn9uq10u.jpg?width=1000",
        "path": "/categories/251/food-drinks/curation/019f7136-ce87-765d-9666-ba278bcd57c4"
      }
    ],
    "shelves": [
      {
        "title": "Top rated",
        "products": [
          {
            "id": "9367993221365",
            "store": "MoonBrew",
            "name": "The Magnesium Sleep Aid",
            "image": "https://cdn.shopify.com/s/files/1/0572/3311/3246/files/OTP_Hot_Cocoa.png?v=1753288496&width=384",
            "price": "US$48.00",
            "reviews": "557",
            "sourceUrl": "https://shop.app/products/9367993221365/the-magnesium-sleep-aid?variantId=47097389383925"
          },
          {
            "id": "1813644935237",
            "store": "FLY BY JING",
            "name": "Original Sichuan Chili Crisp",
            "image": "https://cdn.shopify.com/s/files/1/0065/8515/5653/files/Core4PDP-Original-Hero-1200x1200.png?v=1762458321&width=384",
            "price": "US$30.00",
            "reviews": "392",
            "sourceUrl": "https://shop.app/products/1813644935237/original-sichuan-chili-crisp?variantId=41308865134650"
          },
          {
            "id": "6930356338868",
            "store": "Bachan's",
            "name": "Yuzu Citrus",
            "image": "https://cdn.shopify.com/s/files/1/0414/4444/2279/files/Yuzu-MainPDP.png?v=1777589193&width=384",
            "price": "US$9.49",
            "reviews": "391",
            "sourceUrl": "https://shop.app/products/6930356338868/yuzu-citrus?variantId=40846015561908"
          },
          {
            "id": "4538736410693",
            "store": "Chomps",
            "name": "Best Selling Beef",
            "image": "https://cdn.shopify.com/s/files/1/0209/0776/files/PDP_v3_Best_SellingBeef_01.jpg?v=1787585292&width=384",
            "price": "US$25.60",
            "reviews": "306",
            "sourceUrl": "https://shop.app/products/4538736410693/best-selling-beef?variantId=40494429929541"
          },
          {
            "id": "7249427955895",
            "store": "MUD\\WTR",
            "name": "Matcha (30 serving)",
            "image": "https://cdn.shopify.com/s/files/1/0137/9434/5014/files/Matcha_image_01_66993f9b-8ac3-4ed8-9f45-7eca861d3edf.jpg?v=1773843193&width=384",
            "price": "US$50.00",
            "reviews": "1334",
            "sourceUrl": "https://shop.app/products/7249427955895/matcha-30-serving?variantId=41605719392439"
          },
          {
            "id": "9529593222",
            "store": "Kettle & Fire",
            "name": "100% Grass-fed Beef Bone Broth - 16.9 oz",
            "image": "https://cdn.shopify.com/s/files/1/1775/1825/files/front_side_beef_A-updated.png?v=1705047799&width=384",
            "price": "US$8.49",
            "reviews": "2061",
            "sourceUrl": "https://shop.app/products/9529593222/100-grass-fed-beef-bone-broth-16-9-oz?variantId=28380840919134"
          },
          {
            "id": "5431322476693",
            "store": "Momofuku Goods",
            "name": "Savory Seasoned Salt",
            "image": "https://cdn.shopify.com/s/files/1/0376/8850/8553/products/Savory-Flatlay_0cf01e38-4df3-4151-8963-f05d6bb36230.jpg?v=1762278703&width=384",
            "price": "US$12.00",
            "reviews": "437",
            "sourceUrl": "https://shop.app/products/5431322476693/savory-seasoned-salt?variantId=35126495740053"
          },
          {
            "id": "66258337795",
            "store": "Moon Juice",
            "name": "Cosmic Cocoa™",
            "image": "https://cdn.shopify.com/s/files/1/1095/5588/files/Cosmic-COCOA-new-label.png?v=1782322781&width=384",
            "price": "US$44.00",
            "reviews": "471",
            "sourceUrl": "https://shop.app/products/66258337795/cosmic-cocoa?variantId=887723130883"
          },
          {
            "id": "7387365703740",
            "store": "Lifeboost Coffee",
            "name": "Cognition Mushroom Ground coffee",
            "image": "https://cdn.shopify.com/s/files/1/0838/4525/files/CognitionMushroomCoffee_Stacked_1bag_Ground.png?v=1784217686&width=384",
            "price": "US$29.99",
            "oldPrice": "US$39.99",
            "reviews": "874",
            "sourceUrl": "https://shop.app/products/7387365703740/cognition-mushroom-ground-coffee?variantId=43362772680764"
          },
          {
            "id": "7939387228336",
            "store": "Momofuku Goods",
            "name": "Sesame Miso Noodles | 4 Packs",
            "image": "https://cdn.shopify.com/s/files/1/0376/8850/8553/files/PMO_Sesame-Miso-1-Pack.jpg?v=1779971443&width=256",
            "price": "US$12.00",
            "reviews": "381",
            "sourceUrl": "https://shop.app/products/7939387228336/sesame-miso-noodles-4-packs?variantId=44740606460080"
          },
          {
            "id": "9529610950",
            "store": "Kettle & Fire",
            "name": "Chicken Bone Broth - 16.9 oz",
            "image": "https://cdn.shopify.com/s/files/1/1775/1825/files/2._K_F_16.9_ChickenBB_FrontAngled_April2025.png?v=1766048476&width=256",
            "price": "US$8.49",
            "reviews": "1808",
            "sourceUrl": "https://shop.app/products/9529610950/chicken-bone-broth-16-9-oz?variantId=35553370694"
          },
          {
            "id": "7165158983",
            "store": "Olive My Pickle",
            "name": "Carrot + Dill Fermented Sauerkraut",
            "image": "https://cdn.shopify.com/s/files/1/1336/2941/files/PDP-sauerkraut_8.png?v=1742488232&width=256",
            "price": "US$15.99",
            "reviews": "1015",
            "sourceUrl": "https://shop.app/products/7165158983/carrot-dill-fermented-sauerkraut?variantId=27084360775"
          }
        ]
      },
      {
        "title": "Bestsellers",
        "products": [
          {
            "id": "7459282977020",
            "store": "Big Spoon Roasters",
            "name": "Pistachio Crunch Almond Butter",
            "image": "https://cdn.shopify.com/s/files/1/0569/9226/8462/files/13oz_PCRUNCH-front.png?v=1727363576&width=384",
            "price": "US$16.99",
            "reviews": "294",
            "sourceUrl": "https://shop.app/products/7459282977020/pistachio-crunch-almond-butter?variantId=42102064054524"
          },
          {
            "id": "7998068621562",
            "store": "Rishi Tea & Botanicals",
            "name": "Grapefruit Quince",
            "image": "https://cdn.shopify.com/s/files/1/0645/3788/6970/files/Rishi-PDP-Carousel-GrapefruitQuince-Can.jpg?v=1762452245&width=384",
            "price": "US$48.00",
            "reviews": "8",
            "sourceUrl": "https://shop.app/products/7998068621562/grapefruit-quince?variantId=47770421133562"
          },
          {
            "id": "14804272775538",
            "store": "Ballerina Farm",
            "name": "Farmer Hydrate Powder Bag",
            "image": "https://cdn.shopify.com/s/files/1/0121/0721/9025/files/1.-Raspberry-Lemon-1.jpg?v=1779813487&width=384",
            "price": "HK$311.00",
            "reviews": "1073",
            "sourceUrl": "https://shop.app/products/14804272775538/farmer-hydrate-powder-bag?variantId=60729256182130"
          },
          {
            "id": "7440707518522",
            "store": "FLY BY JING",
            "name": "Ultimate Noodle Variety Pack",
            "image": "https://cdn.shopify.com/s/files/1/0065/8515/5653/files/2026-TiktokShop-NoodlePDP-VarietyPack-Hero-1200x1200.png?v=1772064801&width=384",
            "price": "US$76.50",
            "oldPrice": "US$90.00",
            "reviews": "46",
            "sourceUrl": "https://shop.app/products/7440707518522/ultimate-noodle-variety-pack?variantId=40980647936058"
          },
          {
            "id": "7431684915305",
            "store": "RYZE",
            "name": "RYZE Ritual Set",
            "image": "https://cdn.shopify.com/s/files/1/0247/8597/7449/files/cart.ryze-ritual-set_compressed_8a0b1598-197b-481c-8166-718b3b04dd54.webp?v=1784826430&width=384",
            "price": "US$115.00",
            "reviews": "2.3万",
            "sourceUrl": "https://shop.app/products/7431684915305/ryze-ritual-set?variantId=43246228013161"
          },
          {
            "id": "7476074315874",
            "store": "AG1 (US)",
            "name": "AG1: Pouch",
            "image": "https://cdn.shopify.com/s/files/1/1523/4600/files/pouch_original_93756922-8c4b-4999-82c6-cef94f8b9d55.png?v=1780948459&width=384",
            "price": "US$99.00",
            "reviews": "3109",
            "sourceUrl": "https://shop.app/products/7476074315874/ag1-pouch?variantId=42364990652514"
          },
          {
            "id": "9078100001079",
            "store": "Good Ranchers",
            "name": "Better than Organic Chicken",
            "image": "https://cdn.shopify.com/s/files/1/0837/3325/0359/files/20260128-5H4A6735_result.webp?v=1771623801&width=256",
            "price": "US$187.00",
            "reviews": "1172",
            "sourceUrl": "https://shop.app/products/9078100001079/better-than-organic-chicken?variantId=48459144429879"
          },
          {
            "id": "3818023125062",
            "store": "OLIPOP",
            "name": "Vintage Cola",
            "image": "https://cdn.shopify.com/s/files/1/0034/6610/0806/files/vintage-cola-9g-olipop_gallery-image_single-can_new_asset.webp?v=1779161590&width=256",
            "price": "US$35.99",
            "reviews": "415",
            "sourceUrl": "https://shop.app/products/3818023125062/vintage-cola?variantId=30315238260806"
          },
          {
            "id": "7966947868924",
            "store": "Manukora",
            "name": "MGO 850+ Stick Packets (30-Pack)",
            "image": "https://cdn.shopify.com/s/files/1/0005/4447/3203/files/MNK_CORE_MGO850_CANISTER_1x_1600x1000_7ae7780d-9e0b-4a37-9693-2bcf499b4c1d.jpg?v=1779915103&width=256",
            "price": "US$120.00",
            "reviews": "226",
            "sourceUrl": "https://shop.app/products/7966947868924/mgo-850-stick-packets-30-pack?variantId=44054175875324"
          },
          {
            "id": "9465622800",
            "store": "Chomps",
            "name": "Original Beef",
            "image": "https://cdn.shopify.com/s/files/1/0209/0776/files/PDP_v3_Original_Beef_01.jpg?v=1787570350&width=256",
            "price": "US$25.60",
            "reviews": "3694",
            "sourceUrl": "https://shop.app/products/9465622800/original-beef?variantId=12413340614725"
          },
          {
            "id": "8117692006633",
            "store": "Boarderie",
            "name": "Father's Day Classic Cheese & DAD-cuterie Board",
            "image": "https://cdn.shopify.com/s/files/1/0630/6883/1977/files/charcuterie-board-father_s-day-small_92e95598-c877-4186-90a3-50bcd3d7d755.webp?v=1748556527&width=256",
            "price": "US$139.00",
            "reviews": "1338",
            "sourceUrl": "https://shop.app/products/8117692006633/fathers-day-classic-cheese-dad-cuterie-board?variantId=45981549363433"
          },
          {
            "id": "7974127075561",
            "store": "Stars + Honey",
            "name": "Dark Chocolate Coconut",
            "image": "https://cdn.shopify.com/s/files/1/0664/6100/8105/files/1_-_Upright_Bar_2.png?v=1788439562&width=256",
            "price": "US$36.00",
            "reviews": "777",
            "sourceUrl": "https://shop.app/products/7974127075561/dark-chocolate-coconut?variantId=44030762385641"
          }
        ]
      }
    ]
  },
  "baby-toddler": {
    "title": "Baby & Toddler",
    "path": "/categories/209/baby-toddler",
    "topics": [
      {
        "name": "Clothing",
        "path": "/categories/171/clothing",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_171_L2_baby_toddler_clothing_pill.png?format=webp"
      },
      {
        "name": "Nursing & feeding",
        "path": "/categories/217/nursing-feeding",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_217_L2_baby_toddler_nursing_feeding_pill.png?format=webp"
      },
      {
        "name": "Sleepwear",
        "path": "/categories/210/sleepwear",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_210_L2_baby_toddler_sleepwear_pill.png?format=webp"
      },
      {
        "name": "Baby care",
        "path": "/categories/220/baby-care",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_220_L2_baby_toddler_baby_care_pill.png?format=webp"
      },
      {
        "name": "Swaddling & blankets",
        "path": "/categories/223/swaddling-blankets",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_223_L2_baby_toddler_swaddling_blankets_pill.png?format=webp"
      },
      {
        "name": "Diapers",
        "path": "/categories/224/diapers",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_224_L2_baby_toddler_diapers_pill.png?format=webp"
      },
      {
        "name": "Furniture",
        "path": "/categories/143/furniture",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_143_L2_baby_toddler_furniture_pill.png?format=webp"
      },
      {
        "name": "Shoes",
        "path": "/categories/216/shoes",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_216_L2_baby_toddler_shoes_pill.png?format=webp"
      },
      {
        "name": "Strollers & travel",
        "path": "/categories/225/strollers-travel",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_225_L2_baby_toddler_strollers_travel_pill.png?format=webp"
      }
    ],
    "featuredCategories": [
      {
        "name": "Bottoms",
        "path": "/categories/214/bottoms",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_214_L3_baby_toddler_clothing_bottoms.png?width=512"
      },
      {
        "name": "Dresses",
        "path": "/categories/213/dresses",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_213_L3_baby_toddler_clothing_dresses.png?width=512"
      },
      {
        "name": "One-pieces",
        "path": "/categories/212/one-pieces",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_212_L3_baby_toddler_clothing_one_pieces.png?width=512"
      },
      {
        "name": "Tops",
        "path": "/categories/215/tops",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_215_L3_baby_toddler_clothing_tops.png?width=512"
      }
    ],
    "editorials": [
      {
        "title": "Back-to-school backpacks",
        "description": "From Bentgo, Ten Little, and Moonkie.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/7kltddwgdspybd79esc2eox72nit.gif?width=1000",
        "path": "/categories/209/baby-toddler/curation/01a000fb-82a2-7454-856b-3da0a9c7a31b"
      },
      {
        "title": "Stroller packing list",
        "description": "Strollers, sun shades, and caddies.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/rbw6tsvoqy13i1x59yidvuq26s1m.jpg?width=1000",
        "path": "/categories/209/baby-toddler/curation/019f7136-cb9e-7de9-a631-9dc2ae412dd5"
      },
      {
        "title": "Portable mealtime picks",
        "description": "Boosters, placemats, and clip-on seats.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/6raet8jrqomkotrpuwuu6mwoiecq.jpg?width=1000",
        "path": "/categories/209/baby-toddler/curation/019f7136-cb02-79e9-89cd-943386551abf"
      }
    ],
    "shelves": [
      {
        "title": "Bestsellers",
        "products": [
          {
            "id": "7903942836310",
            "store": "Pipette",
            "name": "Carry-On Kit",
            "image": "https://cdn.shopify.com/s/files/1/0140/8847/0614/files/CarryOnBundle.jpg?v=1781469221&width=384",
            "price": "US$32.69",
            "oldPrice": "US$38.47",
            "reviews": "2",
            "sourceUrl": "https://shop.app/products/7903942836310/carry-on-kit?variantId=44946683101270"
          },
          {
            "id": "7878024855609",
            "store": "Snuggle Me Organic",
            "name": "Infant Lounger Curve | Natural",
            "image": "https://cdn.shopify.com/s/files/1/0076/6597/5353/files/Natural_2048x2048_Warning.png?v=1787301048&width=384",
            "price": "US$79.99",
            "oldPrice": "US$99.99",
            "reviews": "24",
            "sourceUrl": "https://shop.app/products/7878024855609/infant-lounger-curve-natural?variantId=44384548880441"
          },
          {
            "id": "8297076162607",
            "store": "House of Noa",
            "name": "Play Chair | Finley (Cover Only)",
            "image": "https://cdn.shopify.com/s/files/1/1298/8789/files/HouseofNoa-LargePlayChair-FinleyTaupe_Sable.jpg?v=1781103360&width=384",
            "price": "US$89.00",
            "sourceUrl": "https://shop.app/products/8297076162607/play-chair-finley-cover-only?variantId=45456499834927"
          },
          {
            "id": "4471557914690",
            "store": "Coterie",
            "name": "The Diaper",
            "image": "https://cdn.shopify.com/s/files/1/0254/8118/3298/files/diaper-render-thumb_202605_2x_2.jpg?v=1778678235&width=384",
            "price": "US$105.50",
            "reviews": "1.1万",
            "sourceUrl": "https://shop.app/products/4471557914690/the-diaper?variantId=43377137385666"
          },
          {
            "id": "8133907906614",
            "store": "Babyletto",
            "name": "Lido Wave Bookshelf with Hooks",
            "image": "https://cdn.shopify.com/s/files/1/1801/7811/files/hlvinafhqewyyz7fnveg.jpg?v=1788744289&width=384",
            "price": "US$69.00",
            "sourceUrl": "https://shop.app/products/8133907906614/lido-wave-bookshelf-with-hooks?variantId=44664764268598"
          },
          {
            "id": "1522566341",
            "store": "Tubby Todd Bath Co.",
            "name": "All Over Ointment Eczema Treatment",
            "image": "https://cdn.shopify.com/s/files/1/0287/5564/files/AOO-Hero-Image_NEAseal_8oz.jpg?v=1764199484&width=384",
            "price": "US$36.00",
            "reviews": "1.1万",
            "sourceUrl": "https://shop.app/products/1522566341/all-over-ointment-eczema-treatment?variantId=42702883553474"
          },
          {
            "id": "553111519266",
            "store": "Baby Brezza",
            "name": "Formula Pro® Advanced Baby Formula Dispenser",
            "image": "https://cdn.shopify.com/s/files/1/1465/2384/files/FPA_Carousel_01_classic.webp?v=1758552426&width=384",
            "price": "US$229.99",
            "reviews": "593",
            "sourceUrl": "https://shop.app/products/553111519266/formula-pro-advanced-baby-formula-dispenser?variantId=6977210581026"
          },
          {
            "id": "6587609645099",
            "store": "Rowan, Inc.",
            "name": "Advanced Ear Cleansing Solution",
            "image": "https://cdn.shopify.com/s/files/1/1871/4993/files/Aftercare_2025.png?v=1767991397&width=256",
            "price": "US$20.00",
            "reviews": "1689",
            "sourceUrl": "https://shop.app/products/6587609645099/advanced-ear-cleansing-solution?variantId=40719312814123"
          },
          {
            "id": "7089473388629",
            "store": "Bobbie",
            "name": "Organic Whole Milk Infant Formula",
            "image": "https://cdn.shopify.com/s/files/1/0066/2280/6101/files/OWM-Blue-1_Can-PDP.jpg?v=1762300383&width=256",
            "price": "US$28.00",
            "reviews": "399",
            "sourceUrl": "https://shop.app/products/7089473388629/organic-whole-milk-infant-formula?variantId=41593602605141"
          },
          {
            "id": "7134036885568",
            "store": "Lalo",
            "name": "The Hook-On Chair",
            "image": "https://cdn.shopify.com/s/files/1/0037/5062/5344/files/The-Hook-On-Chair-Licorice-01_50895634-15eb-4213-80ba-2e043091e595.jpg?v=1785787199&width=256",
            "price": "US$89.99",
            "reviews": "373",
            "sourceUrl": "https://shop.app/products/7134036885568/the-hook-on-chair?variantId=40621804159040"
          },
          {
            "id": "612162764858",
            "store": "Newton Baby",
            "name": "Waterproof Crib Mattress Pad",
            "image": "https://cdn.shopify.com/s/files/1/0792/0323/files/CribPadSingle3000_1.jpg?v=1762279732&width=256",
            "price": "US$79.99",
            "reviews": "314",
            "sourceUrl": "https://shop.app/products/612162764858/waterproof-crib-mattress-pad?variantId=7494726811706"
          },
          {
            "id": "4737685717052",
            "store": "Caden Lane",
            "name": "Personalized Baby Name Swaddle Blanket",
            "image": "https://cdn.shopify.com/s/files/1/1275/3323/files/baby-pink-blockscript-mock.jpg?v=1768844777&width=256",
            "price": "HK$385.00",
            "reviews": "3278",
            "sourceUrl": "https://shop.app/products/4737685717052/personalized-baby-name-swaddle-blanket?variantId=43920961830972"
          }
        ]
      },
      {
        "title": "Top rated",
        "products": [
          {
            "id": "7286955540523",
            "store": "Hatch",
            "name": "Restore 3",
            "image": "https://cdn.shopify.com/s/files/1/0956/6514/files/R3_Greige.jpg?v=1734716927&width=384",
            "price": "US$169.99",
            "reviews": "1234",
            "sourceUrl": "https://shop.app/products/7286955540523/restore-3?variantId=41212547530795"
          },
          {
            "id": "7576608604360",
            "store": "Nugget",
            "name": "The Nugget® - Willow",
            "image": "https://cdn.shopify.com/s/files/1/0034/1065/7398/files/willow_colored-background-ghk.jpg?v=1742936821&width=384",
            "price": "US$279.00",
            "reviews": "337",
            "sourceUrl": "https://shop.app/products/7576608604360/the-nugget-willow?variantId=42809939689672"
          },
          {
            "id": "1485004079215",
            "store": "Kyte Baby",
            "name": "Sleep Bag in Slate 1.0",
            "image": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/SlateSleepBag1.0-02.jpg?v=1787339621&width=384",
            "price": "US$55.00",
            "reviews": "589",
            "sourceUrl": "https://shop.app/products/1485004079215/sleep-bag-in-slate-1-0?variantId=40852024098927"
          },
          {
            "id": "2328325816378",
            "store": "Newton Baby",
            "name": "Waterproof Crib Mattress",
            "image": "https://cdn.shopify.com/s/files/1/0792/0323/products/600x600-Mattress---Waterproof-WHT.jpg?v=1774553617&width=384",
            "price": "US$349.99",
            "reviews": "889",
            "sourceUrl": "https://shop.app/products/2328325816378/waterproof-crib-mattress?variantId=41735691763909"
          },
          {
            "id": "7646019616967",
            "store": "Owlet US",
            "name": "Dream Sock®",
            "image": "https://cdn.shopify.com/s/files/1/1004/3036/files/US_DreamSock_1_Mint.png?v=1755537468&width=384",
            "price": "US$299.99",
            "reviews": "427",
            "sourceUrl": "https://shop.app/products/7646019616967/dream-sock?variantId=43878918389959"
          },
          {
            "id": "4817371725885",
            "store": "ezpz",
            "name": "Mini Cup + Straw Training System",
            "image": "https://cdn.shopify.com/s/files/1/0033/7772/5509/products/minicupandstraw_pewter_bumps.jpg?v=1774239584&width=384",
            "price": "US$17.49",
            "reviews": "2161",
            "sourceUrl": "https://shop.app/products/4817371725885/mini-cup-straw-training-system?variantId=32907802017853"
          },
          {
            "id": "3876010786902",
            "store": "Pipette",
            "name": "Baby Shampoo + Wash",
            "image": "https://cdn.shopify.com/s/files/1/0140/8847/0614/files/Baby_ShampooWash_Liter_FF.jpg?v=1778603175&width=256",
            "price": "US$28.50",
            "reviews": "350",
            "sourceUrl": "https://shop.app/products/3876010786902/baby-shampoo-wash?variantId=44689547198550"
          },
          {
            "id": "4588779634776",
            "store": "Warmies USA",
            "name": "Sloth Warmies",
            "image": "https://cdn.shopify.com/s/files/1/0284/0680/8664/files/CP-SLO-1-Sloth-02_da77d4fb-5e16-4b40-9e7b-89886f055df1.jpg?v=1780083709&width=256",
            "price": "US$29.99",
            "reviews": "1019",
            "sourceUrl": "https://shop.app/products/4588779634776/sloth-warmies?variantId=32740108075096"
          },
          {
            "id": "1879429972083",
            "store": "Itzy Ritzy",
            "name": "Diaper Bag Charm Pod",
            "image": "https://cdn.shopify.com/s/files/1/1405/7294/files/1_c77242df-ed20-43f5-b312-0e10b442566f.jpg?v=1776870012&width=256",
            "price": "US$16.99",
            "reviews": "190",
            "sourceUrl": "https://shop.app/products/1879429972083/diaper-bag-charm-pod?variantId=43116659671211"
          },
          {
            "id": "6872584323138",
            "store": "WildBird",
            "name": "Willow - Aerial Carrier",
            "image": "https://cdn.shopify.com/s/files/1/3040/7690/files/01.WillowAerialCarrier.webp?v=1784043580&width=256",
            "price": "HK$1,417.00",
            "reviews": "624",
            "sourceUrl": "https://shop.app/products/6872584323138/willow-aerial-carrier?variantId=42056379859010"
          },
          {
            "id": "7809868202150",
            "store": "Mockingbird",
            "name": "Mockingbird High Chair",
            "image": "https://cdn.shopify.com/s/files/1/0023/9691/3753/files/Mobile_1_Natural_Studio_HC-mode.png?v=1764052428&width=256",
            "price": "US$249.00",
            "reviews": "806",
            "sourceUrl": "https://shop.app/products/7809868202150/mockingbird-high-chair?variantId=46425597247654"
          },
          {
            "id": "4670830510213",
            "store": "Nestig",
            "name": "The Wave Crib",
            "image": "https://cdn.shopify.com/s/files/1/0089/8357/6638/files/03_2_1.jpg?v=1731698721&width=256",
            "price": "US$849.00",
            "reviews": "1780",
            "sourceUrl": "https://shop.app/products/4670830510213/the-wave-crib?variantId=34526002118824"
          }
        ]
      }
    ]
  },
  "fitness-nutrition": {
    "title": "Fitness & nutrition",
    "path": "/categories/69/fitness-nutrition",
    "topics": [
      {
        "name": "Vitamins & supplements",
        "path": "/categories/240/vitamins-supplements",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_240_L2_fitness_nutrition_vitamins_supplements_pill.png?format=webp"
      },
      {
        "name": "Nutrition",
        "path": "/categories/245/nutrition",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_245_L2_fitness_nutrition_nutrition_pill.png?format=webp"
      },
      {
        "name": "Women's activewear",
        "path": "/categories/226/womens-activewear",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_226_L2_fitness_nutrition_womens_activewear_pill.png?format=webp"
      },
      {
        "name": "Women's sneakers",
        "path": "/categories/238/womens-sneakers",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_238_L2_fitness_nutrition_womens_sneakers_pill.png?format=webp"
      },
      {
        "name": "Men's sneakers",
        "path": "/categories/239/mens-sneakers",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_239_L2_fitness_nutrition_mens_sneakers_pill.png?format=webp"
      },
      {
        "name": "Men's activewear",
        "path": "/categories/233/mens-activewear",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_233_L2_fitness_nutrition_mens_activewear_pill.png?format=webp"
      },
      {
        "name": "Tumblers & water bottles",
        "path": "/categories/249/tumblers-water-bottles",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_249_L2_fitness_nutrition_tumblers_water_bottles_pill.png?format=webp"
      },
      {
        "name": "Exercise equipment",
        "path": "/categories/250/exercise-equipment",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_250_L2_fitness_nutrition_exercise_equipment_pill.png?format=webp"
      }
    ],
    "featuredCategories": [
      {
        "name": "Exercise equipment",
        "path": "/categories/250/exercise-equipment",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_250_L2_fitness_nutrition_exercise_equipment.png?width=512"
      },
      {
        "name": "Supplements",
        "path": "/categories/242/supplements",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_242_L3_fitness_nutrition_vitamins_supplements_supplements.png?width=512"
      },
      {
        "name": "Tumblers & water bottles",
        "path": "/categories/249/tumblers-water-bottles",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_249_L2_fitness_nutrition_tumblers_water_bottles.png?width=512"
      },
      {
        "name": "Vitamins",
        "path": "/categories/241/vitamins",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_241_L3_fitness_nutrition_vitamins_supplements_vitamins.png?width=512"
      }
    ],
    "editorials": [
      {
        "title": "Fall running layers",
        "description": "Tanks, quarter-zips, and compression bottoms.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/iikgodawfxqpwywo3rzjiq1osux4.jpg?width=1000",
        "path": "/categories/69/fitness-nutrition/curation/01a000fc-2780-71be-81c0-14d2d0a22d4c"
      },
      {
        "title": "WFH cardio essentials",
        "description": "Under-desk exercisers and accessories.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/6yvq7l2rh0zc7tgdp1h640mof5cf.jpg?width=1000",
        "path": "/categories/69/fitness-nutrition/curation/01a000fb-39b6-70a3-ae6c-383d63a2ed36"
      },
      {
        "title": "Protein for GLP-1 routines",
        "description": "Powders, shakes, and mini bars.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/xc51y6zwfgspvrgxtvynq5c9rwu9.jpg?width=1000",
        "path": "/categories/69/fitness-nutrition/curation/019f7136-cd2c-7c9a-8cfa-176df28cc0fd"
      }
    ],
    "shelves": [
      {
        "title": "Shoppers are loving",
        "products": [
          {
            "id": "803902586933",
            "store": "SaschaFitness",
            "name": "PINA COLADA",
            "image": "https://cdn.shopify.com/s/files/1/0003/8030/5461/files/PINECOLADA01.jpg?v=1769784811&width=384",
            "price": "US$38.99",
            "reviews": "237",
            "sourceUrl": "https://shop.app/products/803902586933/pina-colada?variantId=12976456597557"
          },
          {
            "id": "7159505158284",
            "store": "Vitality",
            "name": "Cloud II™ Pant - Midnight",
            "image": "https://cdn.shopify.com/s/files/1/0005/7750/3289/files/DSC01244.jpg?v=1761153659&width=384",
            "price": "HK$660.00",
            "oldPrice": "HK$820.00",
            "reviews": "1563",
            "sourceUrl": "https://shop.app/products/7159505158284/cloud-ii-pant-midnight?variantId=41362215403660"
          },
          {
            "id": "7423894847586",
            "store": "AG1 (US)",
            "name": "AG1: Flavor Sampler (3ct)",
            "image": "https://cdn.shopify.com/s/files/1/1523/4600/files/Original_1.png?v=1787071375&width=384",
            "price": "US$15.00",
            "reviews": "614",
            "sourceUrl": "https://shop.app/products/7423894847586/ag1-flavor-sampler-3ct?variantId=42634220798050"
          },
          {
            "id": "6643142066248",
            "store": "LSKD",
            "name": "Daily 7\" Short - Black-White",
            "image": "https://cdn.shopify.com/s/files/1/0993/2004/files/L-Model-Daily-7-Short-Black-White-3.jpg?v=1759820802&width=384",
            "price": "AU$50.00",
            "reviews": "1041",
            "sourceUrl": "https://shop.app/products/6643142066248/daily-7-short-black-white?variantId=39553955889224"
          },
          {
            "id": "8939258151212",
            "store": "Buoy",
            "name": "Digestion Drops",
            "image": "https://cdn.shopify.com/s/files/1/0267/3351/0727/files/1_1_Digestion_x3_de678a1f-8a32-4bce-93a1-2f834b5f2633.webp?v=1776873039&width=384",
            "price": "HK$359.00",
            "reviews": "642",
            "sourceUrl": "https://shop.app/products/8939258151212/digestion-drops?variantId=47638039396652"
          },
          {
            "id": "4416938803300",
            "store": "Bloom Nutrition",
            "name": "Whey Isolate Protein",
            "image": "https://cdn.shopify.com/s/files/1/0143/0952/3556/files/0001_Whey_StrawberryMilkshake_Shopify_07ca74df-3c30-4c1a-8f62-855224c012b7.jpg?v=1702959501&width=384",
            "price": "HK$306.00",
            "oldPrice": "HK$438.00",
            "reviews": "1615",
            "sourceUrl": "https://shop.app/products/4416938803300/whey-isolate-protein?variantId=41066704601188"
          },
          {
            "id": "6858442145894",
            "store": "Adanola",
            "name": "3 Pack Socks - White, Black, Grey",
            "image": "https://cdn.shopify.com/s/files/1/2156/4663/files/Socks_Mix-BGW.png?v=1752583922&width=384",
            "price": "US$50.00",
            "reviews": "425",
            "sourceUrl": "https://shop.app/products/6858442145894/3-pack-socks-white-black-grey?variantId=55888745234805"
          },
          {
            "id": "7199047516223",
            "store": "The Feed",
            "name": "LMNT Samples",
            "image": "https://cdn.shopify.com/s/files/1/1515/2714/files/lmnt_samples_3pk.png?v=1771262036&width=256",
            "price": "HK$47.74",
            "reviews": "1088",
            "sourceUrl": "https://shop.app/products/7199047516223/lmnt-samples?variantId=41560570855487"
          },
          {
            "id": "7809124401301",
            "store": "O POSITIV",
            "name": "Sex Collection",
            "image": "https://cdn.shopify.com/s/files/1/0588/9340/2261/files/Sex-Collection-Bundle.png?v=1762197984&width=256",
            "price": "US$78.00",
            "oldPrice": "US$96.00",
            "reviews": "312",
            "sourceUrl": "https://shop.app/products/7809124401301/sex-collection?variantId=43186335449237"
          },
          {
            "id": "4336517775459",
            "store": "Beyond Yoga",
            "name": "Spacedye™ Caught In The Midi High Waisted Legging",
            "image": "https://cdn.shopify.com/s/files/1/0265/6141/3219/files/SD3243_darkest-night_13629.jpg?v=1752018034&width=256",
            "price": "HK$788.00",
            "reviews": "988",
            "sourceUrl": "https://shop.app/products/4336517775459/spacedye-caught-in-the-midi-high-waisted-legging?variantId=31170155872355"
          },
          {
            "id": "6758309429331",
            "store": "POPFLEX®",
            "name": "CloudCushion Vegan Suede Yoga Mat - Cool Cosmos 0.5\" Thick",
            "image": "https://cdn.shopify.com/s/files/1/1089/2102/files/BF-Popflex-Galaxy-Mat-Extra-Thick-StackedView-Edit_2999c758-a9e6-40a0-b4e7-9f76c865cf8a.jpg?v=1777450540&width=256",
            "price": "HK$692.00",
            "reviews": "349",
            "sourceUrl": "https://shop.app/products/6758309429331/cloudcushion-vegan-suede-yoga-mat-cool-cosmos-0-5-thick?variantId=39899986624595"
          },
          {
            "id": "7309611532461",
            "store": "Varley US",
            "name": "Hawley Half Zip Sweat",
            "image": "https://cdn.shopify.com/s/files/1/0009/8562/8738/files/8b894426d0217a43c5b4267d6aa73ee155240f5d_VAR01461_Hawley_Half_Zip_Sweat_Black.jpg?v=1786457558&width=256",
            "price": "US$148.00",
            "reviews": "553",
            "sourceUrl": "https://shop.app/products/7309611532461/hawley-half-zip-sweat?variantId=42089735749805"
          }
        ]
      },
      {
        "title": "What's new",
        "products": [
          {
            "id": "15115613077808",
            "store": "Reebok",
            "name": "Women's Classic AZ Shoes",
            "image": "https://cdn.shopify.com/s/files/1/0862/7834/0912/files/100260991_SLC_eCom.jpg?v=1779882572&width=384",
            "price": "US$75.00",
            "sourceUrl": "https://shop.app/products/15115613077808/womens-classic-az-shoes?variantId=66874562281776"
          },
          {
            "id": "7286352281793",
            "store": "Just Ingredients",
            "name": "Raspberry Lemonade Pre-Workout",
            "image": "https://cdn.shopify.com/s/files/1/0080/2684/9357/files/01_PRODUCTMOCKUP_3dfa41cc-fc83-44ed-a993-c44433b07582.png?v=1776808242&width=384",
            "price": "US$39.99",
            "reviews": "483",
            "sourceUrl": "https://shop.app/products/7286352281793/raspberry-lemonade-pre-workout?variantId=41732954194113"
          },
          {
            "id": "4594792497270",
            "store": "Alo Yoga",
            "name": "Uplifting Yoga Block - Jungle/Silver",
            "image": "https://cdn.shopify.com/s/files/1/2185/2813/products/A0084U_04006_b1_a1_01b42e14-7c50-4fcc-88d9-2ec8aca7f704.jpg?v=1671760809&width=384",
            "price": "HK$300.00",
            "reviews": "22",
            "sourceUrl": "https://shop.app/products/4594792497270/uplifting-yoga-block-jungle-silver?variantId=32094343069814"
          },
          {
            "id": "9526922674389",
            "store": "Commonwealth Running Co.",
            "name": "Maurten Additions",
            "image": "https://cdn.shopify.com/s/files/1/0314/5200/4483/files/Screenshot2026-08-07at4.52.40PM.png?v=1786139918&width=384",
            "price": "US$3.50",
            "sourceUrl": "https://shop.app/products/9526922674389/maurten-additions?variantId=54457281806549"
          },
          {
            "id": "8305901502527",
            "store": "The Feed",
            "name": "Thorne Immune Activator",
            "image": "https://cdn.shopify.com/s/files/1/1515/2714/files/thorne_dimmune_activator.png?v=1787174150&width=384",
            "price": "HK$389.91",
            "sourceUrl": "https://shop.app/products/8305901502527/thorne-immune-activator?variantId=43743289770047"
          },
          {
            "id": "9132384813314",
            "store": "Sporty & Rich",
            "name": "Serif Logo Socks - Navy/White",
            "image": "https://cdn.shopify.com/s/files/1/1567/4667/files/FW25-U23-1.jpg?v=1760369246&width=384",
            "price": "HK$325.00",
            "sourceUrl": "https://shop.app/products/9132384813314/serif-logo-socks-navy-white?variantId=46818022621442"
          },
          {
            "id": "7031435919432",
            "store": "LSKD",
            "name": "Accelerate Run Belt - Lemon-Pink Rose",
            "image": "https://cdn.shopify.com/s/files/1/0993/2004/files/studio-accelerate-run-belt-lemon-pink-rose-02.jpg?v=1786932043&width=256",
            "price": "AU$60.00",
            "sourceUrl": "https://shop.app/products/7031435919432/accelerate-run-belt-lemon-pink-rose?variantId=41038781415496"
          },
          {
            "id": "7507127337038",
            "store": "Clean Simple Eats",
            "name": "Clear Protein Water: Candied-Cran Apple (12 Pack)",
            "image": "https://cdn.shopify.com/s/files/1/0258/0384/9806/files/Drinks_Candied_Cran-Apple_12.png?v=1762549728&width=256",
            "price": "US$42.99",
            "reviews": "30",
            "sourceUrl": "https://shop.app/products/7507127337038/clear-protein-water-candied-cran-apple-12-pack?variantId=42023959986254"
          },
          {
            "id": "7827480707150",
            "store": "Outdoor Voices",
            "name": "Waffle Baby Tee",
            "image": "https://cdn.shopify.com/s/files/1/0190/1390/files/waffle-baby-tee-outdoor-voices-dusty-pink-1.jpg?v=1786979837&width=256",
            "price": "US$58.00",
            "reviews": "2",
            "sourceUrl": "https://shop.app/products/7827480707150/waffle-baby-tee?variantId=43727021703246"
          },
          {
            "id": "9368500535547",
            "store": "nuuds",
            "name": "Vintage Fleece Short | Dutch Blue",
            "image": "https://cdn.shopify.com/s/files/1/0654/5565/3115/files/W-1694-DCHB-S-0768.jpg?v=1785188206&width=256",
            "price": "HK$509.00",
            "sourceUrl": "https://shop.app/products/9368500535547/vintage-fleece-short-dutch-blue?variantId=49062357238011"
          },
          {
            "id": "9038628585660",
            "store": "YoungLA",
            "name": "W4279 - Studio Edit Fitted Tee",
            "image": "https://cdn.shopify.com/s/files/1/1775/6429/files/maddie_tee.jpg?v=1770766313&width=256",
            "price": "US$35.00",
            "reviews": "34",
            "sourceUrl": "https://shop.app/products/9038628585660/w4279-studio-edit-fitted-tee?variantId=45365345353916"
          },
          {
            "id": "7465558769749",
            "store": "SET ACTIVE",
            "name": "CLASSIC COTTON DAILY SURFSIDE TEE - REEF",
            "image": "https://cdn.shopify.com/s/files/1/0006/7040/0565/files/78-2026_07_02_SET_0439_WEB.jpg?v=1784239147&width=256",
            "price": "US$56.00",
            "reviews": "12",
            "sourceUrl": "https://shop.app/products/7465558769749/classic-cotton-daily-surfside-tee-reef?variantId=42710424485973"
          }
        ]
      }
    ]
  },
  "pet-supplies": {
    "title": "Pet supplies",
    "path": "/categories/15/pet-supplies",
    "topics": [
      {
        "name": "Dog food & treats",
        "path": "/categories/262/dog-food-treats",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_262_L2_pet_supplies_dog_food_treats_pill.png?format=webp"
      },
      {
        "name": "Dog supplies",
        "path": "/categories/263/dog-supplies",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_263_L2_pet_supplies_dog_supplies_pill.png?format=webp"
      },
      {
        "name": "Pet vitamins & supplements",
        "path": "/categories/294/pet-vitamins-supplements",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_294_L2_pet_supplies_pet_vitamins_supplements_pill.png?format=webp"
      },
      {
        "name": "Cat food & treats",
        "path": "/categories/264/cat-food-treats",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_264_L2_pet_supplies_cat_food_treats_pill.png?format=webp"
      },
      {
        "name": "Pet apparel",
        "path": "/categories/266/pet-apparel",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_266_L2_pet_supplies_pet_apparel_pill.png?format=webp"
      },
      {
        "name": "Pet collars & harnesses",
        "path": "/categories/265/pet-collars-harnesses",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_265_L2_pet_supplies_pet_collars_harnesses_pill.png?format=webp"
      }
    ],
    "featuredCategories": [
      {
        "name": "Dog food & treats",
        "path": "/categories/262/dog-food-treats",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_262_L2_pet_supplies_dog_food_treats.png?width=256"
      },
      {
        "name": "Dog supplies",
        "path": "/categories/263/dog-supplies",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_263_L2_pet_supplies_dog_supplies.png?width=256"
      },
      {
        "name": "Pet apparel",
        "path": "/categories/266/pet-apparel",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_266_L2_pet_supplies_pet_apparel.png?width=256"
      },
      {
        "name": "Pet collars & harnesses",
        "path": "/categories/265/pet-collars-harnesses",
        "image": "https://shopify-assets.shopifycdn.com/shop-assets/static_uploads/shop-categories/20260326_265_L2_pet_supplies_pet_collars_harnesses.png?width=256"
      }
    ],
    "editorials": [
      {
        "title": "Rainy day gear",
        "description": "Mats, towel hooks, and odor control.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/wnah2b0evgjg8q4t3gkkpwqyyoi7.jpg?width=1000",
        "path": "/categories/15/pet-supplies/curation/01a000fc-0b3b-7bf2-a56b-17425a804254"
      },
      {
        "title": "Puppy travel zones",
        "description": "Playpens, liners, carriers, and travel bowls.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/5h5fpwahyz0b22hz3h2tff0i15s9.jpg?width=1000",
        "path": "/categories/15/pet-supplies/curation/019f7136-cd32-77fb-81a0-e3cb5e05c93b"
      },
      {
        "title": "Dog routine essentials",
        "description": "Shop leashes, bowls, and lick mats.",
        "image": "https://cdn.shopify.com/b/shop-shopping-events-assets-production/22n5sp33m93ubvff4cc8p3r11ama.jpg?width=1000",
        "path": "/categories/15/pet-supplies/curation/019f7136-cdeb-726d-8282-770031c5a3e2"
      }
    ],
    "shelves": [
      {
        "title": "Just dropped",
        "products": [
          {
            "id": "8190584422596",
            "store": "Woof",
            "name": "Pupsicle Mix Basic Pack",
            "image": "https://cdn.shopify.com/s/files/1/0612/3182/5092/files/Woof_Treat-Mix-Starter-Pack_Bacon-Cheese_Thumbnail_600x600_f5996317-f9d9-49b4-b2de-785d30bcd1ba.png?v=1762268628&width=384",
            "price": "US$33.99",
            "reviews": "10",
            "sourceUrl": "https://shop.app/products/8190584422596/pupsicle-mix-basic-pack?variantId=44889204129988"
          },
          {
            "id": "8017283809363",
            "store": "Ruffwear",
            "name": "Lumenglow™ High-Vis Vest",
            "image": "https://cdn.shopify.com/s/files/1/1577/4333/files/Lumenglow_0005s_0001_Layer-9_1.png?v=1784067246&width=384",
            "price": "US$59.99",
            "reviews": "4",
            "sourceUrl": "https://shop.app/products/8017283809363/lumenglow-high-vis-vest?variantId=45805660766291"
          },
          {
            "id": "7919488663638",
            "store": "The Foggy Dog",
            "name": "Ticking Stripe Dog Travel Mat",
            "image": "https://cdn.shopify.com/s/files/1/1392/6117/files/Fall26_Travel-Mat_Ticking-Stripe_Front.jpg?v=1786579528&width=384",
            "price": "US$39.00",
            "sourceUrl": "https://shop.app/products/7919488663638/ticking-stripe-dog-travel-mat?variantId=45128110080086"
          },
          {
            "id": "9716165542131",
            "store": "PRIDE+GROOM",
            "name": "THE CALMING DUO",
            "image": "https://cdn.shopify.com/s/files/1/0257/7412/9229/files/PG-CALM-DUO.jpg?v=1786463343&width=384",
            "price": "US$46.00",
            "oldPrice": "US$54.00",
            "sourceUrl": "https://shop.app/products/9716165542131/the-calming-duo?variantId=50262128656627"
          },
          {
            "id": "8677313085634",
            "store": "Roosty's",
            "name": "Pest-Free Flock Starter Pack",
            "image": "https://cdn.shopify.com/s/files/1/0524/8866/7330/files/ChatGPTImageJun19_2026_06_08_47PM_8c8cd5ea-9ca0-4aed-b3e9-71ed721a3c99.jpg?v=1781885461&width=384",
            "price": "US$49.95",
            "oldPrice": "US$68.00",
            "sourceUrl": "https://shop.app/products/8677313085634/pest-free-flock-starter-pack?variantId=47928922734786"
          },
          {
            "id": "15144882372978",
            "store": "King Lou Pets",
            "name": "King Lou Beach Club Women's Tank",
            "image": "https://cdn.shopify.com/s/files/1/0515/6028/4320/files/Beach_Club_Women_s_Tank_Top.png?v=1786217398&width=384",
            "price": "US$30.00",
            "sourceUrl": "https://shop.app/products/15144882372978/king-lou-beach-club-womens-tank?variantId=62165054816626"
          },
          {
            "id": "7915062493391",
            "store": "SUNNY TAILS",
            "name": "Sunny Tails Mini Canvas Tote Bag",
            "image": "https://cdn.shopify.com/s/files/1/0552/9803/1823/files/1_598911c3-2bc5-4dcc-bd11-e03ea0f9282b.png?v=1786068967&width=384",
            "price": "HK$136.00",
            "oldPrice": "HK$160.00",
            "reviews": "11",
            "sourceUrl": "https://shop.app/products/7915062493391/sunny-tails-mini-canvas-tote-bag?variantId=45680934387919"
          },
          {
            "id": "10248139407658",
            "store": "Top Shelf Aquatics",
            "name": "TSA Nuclear Fusion Montipora Cap Coral",
            "image": "https://cdn.shopify.com/s/files/1/0783/0873/7322/files/tsa-coral-tsa-nuclear-fusion-montipora-cap-coral-1253772244.jpg?v=1786382858&width=256",
            "price": "US$99.99",
            "oldPrice": "US$164.99",
            "sourceUrl": "https://shop.app/products/10248139407658/tsa-nuclear-fusion-montipora-cap-coral?variantId=52211047858474"
          },
          {
            "id": "8656116547745",
            "store": "HardyPaw",
            "name": "Imoxi (imidacloprid + moxidectin) Topical Solution for Dogs",
            "image": "https://cdn.shopify.com/s/files/1/0593/2446/5313/files/imoxi-imidacloprid-moxidectin-topical-solution-for-dogs-3-9-lbs-121.jpg?v=1785962141&width=256",
            "price": "HK$796.00",
            "sourceUrl": "https://shop.app/products/8656116547745/imoxi-imidacloprid-moxidectin-topical-solution-for-dogs?variantId=46823009845409"
          },
          {
            "id": "7638755147863",
            "store": "BARK",
            "name": "Scooby-Doo™ Hip & Joint Dog Treat Supplements, 30 Ct",
            "image": "https://cdn.shopify.com/s/files/1/0559/3713/8775/files/FOOD_218592_HIP-AND-JOINT-S_GRID_04.png?v=1778149006&width=256",
            "price": "US$24.99",
            "reviews": "8",
            "sourceUrl": "https://shop.app/products/7638755147863/scooby-doo-hip-joint-dog-treat-supplements-30-ct?variantId=42774417014871"
          },
          {
            "id": "8843852415154",
            "store": "Hatching Time",
            "name": "Flock Right Chicken Coop - House Only",
            "image": "https://cdn.shopify.com/s/files/1/0016/4485/5342/files/HTCC810_1.jpg?v=1787924355&width=256",
            "price": "US$543.99",
            "oldPrice": "US$679.99",
            "sourceUrl": "https://shop.app/products/8843852415154/flock-right-chicken-coop-house-only?variantId=47424731447474"
          },
          {
            "id": "9534166860034",
            "store": "Kinn",
            "name": "Heritage Ribbed Pavé Diamond Name Ring",
            "image": "https://cdn.shopify.com/s/files/1/2070/3189/files/kinn_14k_gold_fine_jewelry_heritage_ribbed_pave_diamond_name_ring_english_1.jpg?v=1786468691&width=256",
            "price": "HK$24,000.00",
            "sourceUrl": "https://shop.app/products/9534166860034/heritage-ribbed-pave-diamond-name-ring?variantId=48268220137730"
          }
        ]
      },
      {
        "title": "Bestsellers",
        "products": [
          {
            "id": "8254515937476",
            "store": "Woof",
            "name": "Doggy Dental Mix",
            "image": "https://cdn.shopify.com/s/files/1/0612/3182/5092/files/Woof_Pupsicle-Mix_Doggy-Dental_Thumbnail_600x600_9e453789-8469-4897-bbd6-ccea7daf61a2.png?v=1762268856&width=384",
            "price": "US$19.99",
            "reviews": "257",
            "sourceUrl": "https://shop.app/products/8254515937476/doggy-dental-mix?variantId=44827425243332"
          },
          {
            "id": "4658728580",
            "store": "Aquarium Co-Op",
            "name": "Easy Green All-in-One Fertilizer",
            "image": "https://cdn.shopify.com/s/files/1/0311/3149/files/easy-green-all-in-one-fertilizer-1309778.jpg?v=1766095332&width=384",
            "price": "US$11.99",
            "reviews": "366",
            "sourceUrl": "https://shop.app/products/4658728580/easy-green-all-in-one-fertilizer?variantId=40139624513605"
          },
          {
            "id": "6656451739690",
            "store": "Grubbly Farms",
            "name": "Fresh Pecks Layer",
            "image": "https://cdn.shopify.com/s/files/1/1407/3744/files/GRB-layerpellets-thumnail.png?v=1765390644&width=384",
            "price": "US$54.99",
            "reviews": "3532",
            "sourceUrl": "https://shop.app/products/6656451739690/fresh-pecks-layer?variantId=43892978221098"
          },
          {
            "id": "7288402903247",
            "store": "SUNNY TAILS",
            "name": "Espresso Brown Waste Bag Holder",
            "image": "https://cdn.shopify.com/s/files/1/0552/9803/1823/files/ST_WASTEBAG_ESPRESSO-BROWN_e07cfa90-963d-450d-b07d-0b10dd5232a4.jpg?v=1752280350&width=384",
            "price": "HK$122.00",
            "oldPrice": "HK$144.00",
            "reviews": "32",
            "sourceUrl": "https://shop.app/products/7288402903247/espresso-brown-waste-bag-holder?variantId=43131587723471"
          },
          {
            "id": "8620147985",
            "store": "Tactipup",
            "name": "Extreme Tactical Dog Leash",
            "image": "https://cdn.shopify.com/s/files/1/1717/9379/products/Tactipup_Extreme_Leash_Product_Photo.jpg?v=1632760689&width=256",
            "price": "US$64.95",
            "reviews": "546",
            "sourceUrl": "https://shop.app/products/8620147985/extreme-tactical-dog-leash?variantId=42184960180400"
          },
          {
            "id": "8810764599526",
            "store": "BetterWild",
            "name": "Allergy Relief",
            "image": "https://cdn.shopify.com/s/files/1/0706/0419/4022/files/Product_Image.png?v=1783435119&width=256",
            "price": "US$39.99",
            "reviews": "4360",
            "sourceUrl": "https://shop.app/products/8810764599526/allergy-relief?variantId=45281316307174"
          },
          {
            "id": "8581171937547",
            "store": "Pelsbarn.org",
            "name": "Cooling Mat",
            "image": "https://cdn.shopify.com/s/files/1/0648/1979/0091/files/10_a7dbbcf4-3667-41cc-ac4c-39f86fd8b206_1.jpg?v=1784735554&width=256",
            "price": "US$98.00",
            "oldPrice": "US$140.00",
            "reviews": "30",
            "sourceUrl": "https://shop.app/products/8581171937547/cooling-mat?variantId=57275076280703"
          },
          {
            "id": "10791794933953",
            "store": "Muddy Mat®",
            "name": "Muddy Mat® - Anti-Mud Dog Door Mat",
            "image": "https://cdn.shopify.com/s/files/1/0539/2967/2897/files/Grey_c0e04b27-e57f-4c2e-8b8c-723bff86e502.jpg?v=1788385992&width=256",
            "price": "HK$127.00",
            "oldPrice": "HK$424.00",
            "reviews": "5967",
            "sourceUrl": "https://shop.app/products/10791794933953/muddy-mat-anti-mud-dog-door-mat?variantId=49928952217793"
          },
          {
            "id": "9315641196839",
            "store": "Mika and Sammy's Gourmet Pet Treats",
            "name": "Smoked Beef Marrow Bone",
            "image": "https://cdn.shopify.com/s/files/1/0861/6666/7559/files/ms36-v1-img1.png?v=1753855567&width=256",
            "price": "US$7.99",
            "reviews": "2.9万",
            "sourceUrl": "https://shop.app/products/9315641196839/smoked-beef-marrow-bone?variantId=48483158327591"
          },
          {
            "id": "4330272751704",
            "store": "Wilderdog",
            "name": "Dog Harness",
            "image": "https://cdn.shopify.com/s/files/1/1064/6998/files/HARN-PACI-WOOD.jpg?v=1779910896&width=256",
            "price": "HK$382.00",
            "reviews": "2107",
            "sourceUrl": "https://shop.app/products/4330272751704/dog-harness?variantId=41956484972717"
          },
          {
            "id": "7894669525231",
            "store": "Houndsy",
            "name": "Houndsy Kibble Dispenser Legs",
            "image": "https://cdn.shopify.com/s/files/1/0612/8471/2687/files/Houndsy_-17.png?v=1758713778&width=256",
            "price": "HK$199.00",
            "reviews": "35",
            "sourceUrl": "https://shop.app/products/7894669525231/houndsy-kibble-dispenser-legs?variantId=46880850182383"
          },
          {
            "id": "7948485230786",
            "store": "Roosty's",
            "name": "Daily Worm Defense + Gut Support",
            "image": "https://cdn.shopify.com/s/files/1/0524/8866/7330/files/Untitleddesign-2026-02-19T162012.256_1.jpg?v=1775036197&width=256",
            "price": "US$32.99",
            "oldPrice": "US$35.99",
            "reviews": "5468",
            "sourceUrl": "https://shop.app/products/7948485230786/daily-worm-defense-gut-support?variantId=44751587049666"
          }
        ]
      }
    ]
  }
} satisfies Record<string, CategoryDetail>
