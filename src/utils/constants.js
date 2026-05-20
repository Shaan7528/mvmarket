export const APP_NAME = 'MarketMV'
export const CURRENCY = 'MVR'

export const ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
}

export const STORE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const PRODUCT_STATUS = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const PAYMENT_METHODS = {
  COD: 'cash_on_delivery',
  BANK_TRANSFER: 'bank_transfer',
}

export const DEFAULT_CATEGORIES = [
  { id: 'fashion', name: 'Fashion', icon: 'shirt' },
  { id: 'electronics', name: 'Electronics', icon: 'smartphone' },
  { id: 'food', name: 'Food & Snacks', icon: 'utensils' },
  { id: 'beauty', name: 'Beauty', icon: 'sparkles' },
  { id: 'home', name: 'Home & Living', icon: 'home' },
  { id: 'sports', name: 'Sports', icon: 'dumbbell' },
  { id: 'books', name: 'Books', icon: 'book' },
  { id: 'handmade', name: 'Handmade', icon: 'palette' },
]

export const MALDIVES_ISLANDS = [
  'Malé', 'Hulhumalé', 'Vilimalé', 'Addu City', 'Fuvahmulah',
  'Thinadhoo', 'Kulhudhuffushi', 'Naifaru', 'Dhidhdhoo', 'Eydhafushi',
  'Mahibadhoo', 'Veymandoo', 'Funadhoo', 'Ungoofaaru', 'Meedhoo',
  'Other',
]

export const TRENDING_SEARCHES = [
  'phone case', 'dress', 'snacks', 'perfume', 'sneakers',
  'handmade', 'island delivery', 'gift box',
]

export const COLLECTIONS = {
  USERS: 'users',
  STORES: 'stores',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CATEGORIES: 'categories',
  FAVORITES: 'favorites',
  NOTIFICATIONS: 'notifications',
  FOLLOWS: 'follows',
}
