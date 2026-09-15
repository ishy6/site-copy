export interface WiseNavigationItem {
  id: string
  label: string
  title: string
  description: string
  image: string
  href: string
  links: { label: string; href: string }[]
}

export const wiseNavigationItems: WiseNavigationItem[] = [
  { id: 'personal', label: 'Personal', title: 'Wise personal account', description: 'The fast, low-cost way to send money abroad.', image: '/assets/wise/nav-personal.jpg', href: 'https://wise.com/', links: [{ label: 'Send money', href: 'https://wise.com/hk/send-money/' }, { label: 'Send large amounts', href: 'https://wise.com/hk/large-amounts/' }, { label: 'Personal pricing', href: 'https://wise.com/hk/pricing/' }] },
  { id: 'business', label: 'Business', title: 'A world of business', description: 'One account for your growing global business.', image: '/assets/wise/nav-business.jpg', href: 'https://wise.com/hk/business/', links: [{ label: 'Send payments', href: 'https://wise.com/hk/business/send-payments' }, { label: 'Receive payments', href: 'https://wise.com/hk/business/receive-money' }, { label: 'Manage your team', href: 'https://wise.com/hk/business/manage-team' }, { label: 'Business pricing', href: 'https://wise.com/hk/pricing/business' }] },
  { id: 'platform', label: 'Platform', title: 'Wise Platform', description: 'Connect your customers to a global payments network.', image: '/assets/wise/nav-platform.jpg', href: 'https://wise.com/platform/', links: [{ label: 'Global payments', href: 'https://wise.com/platform/send/' }, { label: 'Multi-currency accounts', href: 'https://wise.com/platform/multi-currency-accounts/' }, { label: 'API documentation', href: 'https://docs.wise.com/api-docs' }] },
]
