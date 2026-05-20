# MarketMV Firestore Schema

## users/{userId}
```js
{
  uid: string,
  email: string,
  displayName: string,
  username: string,        // unique, lowercase
  photoURL: string | null,
  role: 'customer' | 'seller' | 'admin',
  phone: string | null,
  island: string | null,
  storeId: string | null,  // if seller
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

## stores/{storeId}
```js
{
  ownerId: string,
  name: string,
  username: string,        // unique slug for URL
  logo: string | null,
  banner: string | null,
  description: string,
  island: string,
  whatsapp: string,
  telegram: string | null,
  deliveryInfo: string,
  deliveryFee: number,
  pickupAvailable: boolean,
  status: 'pending' | 'approved' | 'rejected',
  featured: boolean,
  followersCount: number,
  productsCount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

## products/{productId}
```js
{
  storeId: string,
  storeName: string,
  storeUsername: string,
  name: string,
  description: string,
  images: string[],
  price: number,
  discountPrice: number | null,
  category: string,
  stock: number,
  status: 'in_stock' | 'out_of_stock',
  variants: {
    sizes: string[],
    colors: string[],
  },
  featured: boolean,
  likesCount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

## orders/{orderId}
```js
{
  userId: string,
  storeId: string,
  storeName: string,
  items: [{
    productId, name, image, price, quantity,
    variant: { size, color }
  }],
  subtotal: number,
  deliveryFee: number,
  total: number,
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled',
  paymentMethod: 'cash_on_delivery' | 'bank_transfer',
  paymentScreenshot: string | null,
  paymentConfirmed: boolean,
  deliveryAddress: {
    name, phone, island, address, notes
  },
  deliveryType: 'delivery' | 'pickup',
  orderNotes: string,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

## categories/{categoryId}
```js
{ name, icon, order, active }
```

## favorites/{favoriteId}
```js
{
  userId: string,
  productId: string,
  createdAt: timestamp,
}
```

## follows/{followId}
```js
{
  userId: string,
  storeId: string,
  createdAt: timestamp,
}
```

## notifications/{notificationId}
```js
{
  userId: string,
  type: 'order' | 'order_update' | 'store_approval' | 'like',
  title: string,
  message: string,
  read: boolean,
  link: string | null,
  createdAt: timestamp,
}
```

## Firestore Indexes (create in Firebase Console)
- products: `status` ASC, `createdAt` DESC
- products: `category` ASC, `createdAt` DESC
- products: `storeId` ASC, `createdAt` DESC
- stores: `status` ASC, `followersCount` DESC
- orders: `userId` ASC, `createdAt` DESC
- orders: `storeId` ASC, `createdAt` DESC
