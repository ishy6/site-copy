export interface ShopCategoryItem {
  name: string
  image: string
}

export interface ShopCategoryGroup {
  name: string
  items: ShopCategoryItem[]
}

export const shopCategories: ShopCategoryGroup[] = [
  {
    name: 'Women',
    items: [
      { name: 'Dresses', image: '/assets/shop/dresses.png' },
      { name: 'Shirts', image: '/assets/shop/shirts.png' },
      { name: 'Sneakers', image: '/assets/shop/sneakers.png' },
      { name: 'Pants', image: '/assets/shop/pants.png' },
    ],
  },
  {
    name: 'Home',
    items: [
      { name: 'Blankets', image: '/assets/shop/blankets.png' },
      { name: 'Rugs', image: '/assets/shop/rugs.png' },
      { name: 'Home fragrances', image: '/assets/shop/fragrances.png' },
      { name: 'Household appliances', image: '/assets/shop/appliances.png' },
    ],
  },
]
