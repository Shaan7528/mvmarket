import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getStore, getProducts, createProduct, updateProduct, deleteProduct } from '../../services/firestoreService'
import { uploadImages } from '../../services/storageService'
import { Modal } from '../../components/ui/Modal'
import { ImageUploader } from '../../components/ImageUploader'
import { formatPrice } from '../../utils/format'
import { DEFAULT_CATEGORIES } from '../../utils/constants'
import { LazyImage } from '../../components/ui/LazyImage'
import toast from 'react-hot-toast'

const emptyProduct = {
  name: '', description: '', price: '', discountPrice: '', category: 'fashion',
  stock: '', sizes: '', colors: '',
}

export function SellerProducts() {
  const { profile } = useAuth()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!profile?.storeId) return
    const s = await getStore(profile.storeId)
    setStore(s)
    const res = await getProducts({ storeId: profile.storeId, pageSize: 100 })
    setProducts(res.items)
  }

  useEffect(() => { load() }, [profile?.storeId])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyProduct)
    setImages([])
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      stock: product.stock,
      sizes: product.variants?.sizes?.join(', ') || '',
      colors: product.variants?.colors?.join(', ') || '',
    })
    setImages(product.images?.map((url) => ({ url, isNew: false })) || [])
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!store) return
    setLoading(true)
    try {
      let imageUrls = images.filter((i) => !i.isNew).map((i) => i.url)
      const newFiles = images.filter((i) => i.isNew && i.file).map((i) => i.file)
      if (newFiles.length) {
        const uploaded = await uploadImages(newFiles, `products/${store.id}`)
        imageUrls = [...imageUrls, ...uploaded]
      }
      const data = {
        name: form.name,
        description: form.description,
        price: form.price,
        discountPrice: form.discountPrice || null,
        category: form.category,
        stock: form.stock,
        images: imageUrls,
        variants: {
          sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()) : [],
          colors: form.colors ? form.colors.split(',').map((c) => c.trim()) : [],
        },
      }
      if (editing) {
        await updateProduct(editing.id, data)
        toast.success('Product updated')
      } else {
        await createProduct(store, data)
        toast.success('Product created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error('Failed to save product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (product) => {
    if (!confirm('Delete this product?')) return
    await deleteProduct(product.id, store.id)
    toast.success('Product deleted')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-1 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-full">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex gap-3 p-3 bg-white rounded-2xl border border-neutral-100">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
              <LazyImage src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{product.name}</h3>
              <p className="text-sm font-bold">{formatPrice(product.discountPrice ?? product.price)}</p>
              <p className="text-xs text-neutral-400">Stock: {product.stock}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-neutral-100 rounded-lg">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(product)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-neutral-400 py-8 text-sm">No products yet. Add your first!</p>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Product name" required
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm" />
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2}
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="Price (MVR)" required
              className="px-4 py-3 bg-neutral-50 rounded-xl text-sm" />
            <input type="number" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} placeholder="Discount price"
              className="px-4 py-3 bg-neutral-50 rounded-xl text-sm" />
          </div>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm">
            {DEFAULT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="Stock quantity" required
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm" />
          <input value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} placeholder="Sizes (comma separated)"
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm" />
          <input value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} placeholder="Colors (comma separated)"
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm" />
          <ImageUploader images={images.map((i) => i.url)} onChange={setImages} />
          <button type="submit" disabled={loading} className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full disabled:opacity-50">
            {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
