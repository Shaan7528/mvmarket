import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, addDoc, serverTimestamp,
  increment, onSnapshot, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS, STORE_STATUS, PRODUCT_STATUS, ORDER_STATUS } from '../utils/constants'

// Cache approved store IDs (avoids repeated reads; cleared on approve)
let approvedStoreIdsCache = null

function productSortTime(p) {
  return p.createdAt?.toMillis?.() ?? (p.createdAt?.seconds ?? 0) * 1000
}

function orderSortTime(o) {
  return o.createdAt?.toMillis?.() ?? (o.createdAt?.seconds ?? 0) * 1000
}

export function clearApprovedStoresCache() {
  approvedStoreIdsCache = null
}

async function getApprovedStoreIds() {
  if (approvedStoreIdsCache) return approvedStoreIdsCache
  const q = query(
    collection(db, COLLECTIONS.STORES),
    where('status', '==', STORE_STATUS.APPROVED),
    limit(200)
  )
  const snap = await getDocs(q)
  approvedStoreIdsCache = new Set(snap.docs.map((d) => d.id))
  return approvedStoreIdsCache
}

// ─── Products ───────────────────────────────────────────────
export async function getProducts(opts = {}) {
  const { category, storeId, featured, pageSize = 12, lastDoc, publicOnly = true } = opts
  const fetchLimit = Math.max(pageSize * 4, 60)

  let snap
  try {
    if (storeId) {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('storeId', '==', storeId),
        limit(fetchLimit)
      )
      snap = await getDocs(q)
    } else if (category) {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('category', '==', category),
        limit(fetchLimit)
      )
      snap = await getDocs(q)
    } else {
      const constraints = [orderBy('createdAt', 'desc'), limit(fetchLimit)]
      if (lastDoc) constraints.push(startAfter(lastDoc))
      snap = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), ...constraints))
    }
  } catch (err) {
    console.warn('getProducts fallback:', err)
    snap = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), limit(fetchLimit)))
  }

  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  items = items.filter((p) => p.status === PRODUCT_STATUS.IN_STOCK)
  if (featured) items = items.filter((p) => p.featured === true)

  if (publicOnly && !storeId) {
    const approved = await getApprovedStoreIds()
    items = items.filter((p) => approved.has(p.storeId))
  }

  items.sort((a, b) => productSortTime(b) - productSortTime(a))

  return {
    items: items.slice(0, pageSize),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: items.length > pageSize || snap.docs.length >= fetchLimit,
  }
}

export async function getProduct(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTS, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function searchProducts(term, pageSize = 20) {
  const lower = term.toLowerCase()
  const approved = await getApprovedStoreIds()
  let snap
  try {
    snap = await getDocs(
      query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt', 'desc'), limit(80))
    )
  } catch {
    snap = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), limit(80)))
  }
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(
      (p) =>
        p.status === PRODUCT_STATUS.IN_STOCK &&
        approved.has(p.storeId) &&
        (p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower) ||
          p.category?.toLowerCase().includes(lower))
    )
    .slice(0, pageSize)
}

// ─── Stores ───────────────────────────────────────────────────
export async function getStores(opts = {}) {
  const { status = STORE_STATUS.APPROVED, featured, pageSize = 12 } = opts
  const q = query(
    collection(db, COLLECTIONS.STORES),
    where('status', '==', status),
    limit(100)
  )
  const snap = await getDocs(q)
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  if (featured) items = items.filter((s) => s.featured === true)
  items.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
  return items.slice(0, pageSize)
}

export async function getStore(id) {
  const snap = await getDoc(doc(db, COLLECTIONS.STORES, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getStoreByUsername(username) {
  const q = query(
    collection(db, COLLECTIONS.STORES),
    where('username', '==', username.toLowerCase()),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function createStore(ownerId, data) {
  const ref = doc(collection(db, COLLECTIONS.STORES))
  const store = {
    ownerId,
    name: data.name,
    username: data.username.toLowerCase(),
    logo: data.logo || null,
    banner: data.banner || null,
    description: data.description || '',
    island: data.island,
    whatsapp: data.whatsapp,
    telegram: data.telegram || null,
    deliveryInfo: data.deliveryInfo || '',
    deliveryFee: Number(data.deliveryFee) || 0,
    pickupAvailable: data.pickupAvailable ?? true,
    status: STORE_STATUS.PENDING,
    featured: false,
    followersCount: 0,
    productsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, store)
  await updateDoc(doc(db, COLLECTIONS.USERS, ownerId), {
    storeId: ref.id,
    role: 'seller',
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, ...store }
}

export async function updateStore(storeId, data) {
  await updateDoc(doc(db, COLLECTIONS.STORES, storeId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// ─── Products CRUD ────────────────────────────────────────────
export async function createProduct(store, data) {
  const ref = doc(collection(db, COLLECTIONS.PRODUCTS))
  const product = {
    storeId: store.id,
    storeName: store.name,
    storeUsername: store.username,
    name: data.name,
    description: data.description,
    images: data.images || [],
    price: Number(data.price),
    discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
    category: data.category,
    stock: Number(data.stock) || 0,
    status: Number(data.stock) > 0 ? PRODUCT_STATUS.IN_STOCK : PRODUCT_STATUS.OUT_OF_STOCK,
    variants: data.variants || { sizes: [], colors: [] },
    featured: false,
    likesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, product)
  await updateDoc(doc(db, COLLECTIONS.STORES, store.id), {
    productsCount: increment(1),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, ...product }
}

export async function updateProduct(productId, data) {
  const updates = { ...data, updatedAt: serverTimestamp() }
  if (data.stock !== undefined) {
    updates.status = Number(data.stock) > 0 ? PRODUCT_STATUS.IN_STOCK : PRODUCT_STATUS.OUT_OF_STOCK
  }
  await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), updates)
}

export async function deleteProduct(productId, storeId) {
  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId))
  await updateDoc(doc(db, COLLECTIONS.STORES, storeId), {
    productsCount: increment(-1),
    updatedAt: serverTimestamp(),
  })
}

// ─── Orders ───────────────────────────────────────────────────
export async function createOrder(orderData) {
  const ref = await addDoc(collection(db, COLLECTIONS.ORDERS), {
    ...orderData,
    status: ORDER_STATUS.PENDING,
    paymentConfirmed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  const orderId = ref.id

  // Notify customer (in-app only — not Telegram/WhatsApp)
  if (orderData.userId) {
    await createNotification({
      userId: orderData.userId,
      type: 'order',
      title: 'Order placed',
      message: `Your order from ${orderData.storeName} was placed successfully.`,
      link: '/orders',
    })
  }

  // Notify shop owner → Seller Dashboard / Notifications
  if (orderData.storeId) {
    const store = await getStore(orderData.storeId)
    if (store?.ownerId) {
      const customerName = orderData.deliveryAddress?.name || 'A customer'
      const itemCount = orderData.items?.length || 0
      await createNotification({
        userId: store.ownerId,
        type: 'order',
        title: 'New order received',
        message: `${customerName} placed an order (${itemCount} item${itemCount !== 1 ? 's' : ''}) — check Seller Dashboard.`,
        link: '/seller/orders',
      })
    }
  }

  return orderId
}

export async function getUserOrders(userId) {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('userId', '==', userId),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => orderSortTime(b) - orderSortTime(a))
}

export async function getStoreOrders(storeId) {
  const ordersQ = query(
    collection(db, COLLECTIONS.ORDERS),
    where('storeId', '==', storeId),
    limit(100)
  )
  const snap = await getDocs(ordersQ)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => orderSortTime(b) - orderSortTime(a))
}

/** Live order feed for seller dashboard */
export function subscribeStoreOrders(storeId, callback) {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('storeId', '==', storeId),
    limit(100)
  )
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => orderSortTime(b) - orderSortTime(a))
      callback(orders)
    },
    (err) => console.error('subscribeStoreOrders:', err)
  )
}

const ORDER_NOTIFY = {
  [ORDER_STATUS.CONFIRMED]: {
    title: 'Order confirmed!',
    message: (store) => `${store} confirmed your order. They will prepare it for delivery.`,
  },
  [ORDER_STATUS.DELIVERED]: {
    title: 'Order delivered!',
    message: (store) => `Your order from ${store} has been marked as delivered.`,
  },
  [ORDER_STATUS.CANCELLED]: {
    title: 'Order cancelled',
    message: (store) => `Your order from ${store} was cancelled. Contact the shop if you have questions.`,
  },
  [ORDER_STATUS.PENDING]: {
    title: 'Order updated',
    message: (store) => `Your order from ${store} is pending again.`,
  },
}

export async function updateOrderStatus(orderId, status) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
  const snap = await getDoc(orderRef)
  if (!snap.exists()) throw new Error('Order not found')

  const order = snap.data()
  if (order.status === status) return

  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  })

  const customerId = order.userId
  if (!customerId) {
    console.warn('Order missing userId — cannot notify customer', orderId)
    return
  }

  const store = order.storeName || 'the store'
  const copy = ORDER_NOTIFY[status] || {
    title: 'Order updated',
    message: () => `Your order from ${store} is now: ${status}.`,
  }

  await createNotification({
    userId: customerId,
    type: 'order_update',
    title: copy.title,
    message: typeof copy.message === 'function' ? copy.message(store) : copy.message,
    link: '/orders',
    orderId,
  })
}

// ─── Favorites ────────────────────────────────────────────────
export async function toggleFavorite(userId, productId) {
  const q = query(
    collection(db, COLLECTIONS.FAVORITES),
    where('userId', '==', userId),
    where('productId', '==', productId),
    limit(1)
  )
  const snap = await getDocs(q)
  if (!snap.empty) {
    await deleteDoc(snap.docs[0].ref)
    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), { likesCount: increment(-1) })
    return false
  }
  await addDoc(collection(db, COLLECTIONS.FAVORITES), {
    userId,
    productId,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), { likesCount: increment(1) })
  return true
}

export async function getUserFavorites(userId) {
  const q = query(
    collection(db, COLLECTIONS.FAVORITES),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const snap = await getDocs(q)
  const productIds = snap.docs.map((d) => d.data().productId)
  if (!productIds.length) return []
  const products = await Promise.all(productIds.map((id) => getProduct(id)))
  return products.filter(Boolean)
}

export async function isFavorited(userId, productId) {
  const q = query(
    collection(db, COLLECTIONS.FAVORITES),
    where('userId', '==', userId),
    where('productId', '==', productId),
    limit(1)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

// ─── Follows ────────────────────────────────────────────────────
export async function toggleFollow(userId, storeId) {
  const q = query(
    collection(db, COLLECTIONS.FOLLOWS),
    where('userId', '==', userId),
    where('storeId', '==', storeId),
    limit(1)
  )
  const snap = await getDocs(q)
  if (!snap.empty) {
    await deleteDoc(snap.docs[0].ref)
    await updateDoc(doc(db, COLLECTIONS.STORES, storeId), { followersCount: increment(-1) })
    return false
  }
  await addDoc(collection(db, COLLECTIONS.FOLLOWS), {
    userId,
    storeId,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, COLLECTIONS.STORES, storeId), { followersCount: increment(1) })
  return true
}

// ─── Notifications ──────────────────────────────────────────────
export async function createNotification(data) {
  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export function subscribeNotifications(userId, callback) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    limit(50)
  )
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => orderSortTime(b) - orderSortTime(a))
      callback(items)
    },
    (err) => {
      console.error('subscribeNotifications failed:', err)
      callback([])
    }
  )
}

export async function markNotificationRead(id) {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true })
}

// ─── Categories ─────────────────────────────────────────────────
export async function getCategories() {
  const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── Admin ──────────────────────────────────────────────────────
export async function getPendingStores() {
  // Simple query only — avoids composite index requirement.
  // (status + orderBy createdAt needs a manual index and fails silently in the UI.)
  const q = query(
    collection(db, COLLECTIONS.STORES),
    where('status', '==', STORE_STATUS.PENDING)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds * 1000 ?? 0
      const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds * 1000 ?? 0
      return tb - ta
    })
}

export async function approveStore(storeId, ownerId) {
  clearApprovedStoresCache()
  await updateDoc(doc(db, COLLECTIONS.STORES, storeId), {
    status: STORE_STATUS.APPROVED,
    updatedAt: serverTimestamp(),
  })
  await createNotification({
    userId: ownerId,
    type: 'store_approval',
    title: 'Store Approved!',
    message: 'Your store has been approved and is now live on MarketMV.',
    link: `/store/${storeId}`,
  })
}

export async function getPlatformStats() {
  const [stores, products, orders] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.STORES)),
    getDocs(collection(db, COLLECTIONS.PRODUCTS)),
    getDocs(collection(db, COLLECTIONS.ORDERS)),
  ])
  return {
    totalStores: stores.size,
    approvedStores: stores.docs.filter((d) => d.data().status === STORE_STATUS.APPROVED).length,
    totalProducts: products.size,
    totalOrders: orders.size,
    pendingStores: stores.docs.filter((d) => d.data().status === STORE_STATUS.PENDING).length,
  }
}

export async function searchStores(term) {
  const q = query(
    collection(db, COLLECTIONS.STORES),
    where('status', '==', STORE_STATUS.APPROVED),
    limit(50)
  )
  const snap = await getDocs(q)
  const lower = term.toLowerCase()
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s) =>
      s.name?.toLowerCase().includes(lower) ||
      s.username?.toLowerCase().includes(lower) ||
      s.island?.toLowerCase().includes(lower)
    )
}

/** Products belonging to stores that are still pending approval */
export async function getProductsFromPendingStores() {
  const pendingQ = query(
    collection(db, COLLECTIONS.STORES),
    where('status', '==', STORE_STATUS.PENDING),
    limit(50)
  )
  const pendingSnap = await getDocs(pendingQ)
  const pendingIds = new Set(pendingSnap.docs.map((d) => d.id))
  if (pendingIds.size === 0) return []

  const productsSnap = await getDocs(
    query(collection(db, COLLECTIONS.PRODUCTS), limit(200))
  )
  return productsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => pendingIds.has(p.storeId))
}
