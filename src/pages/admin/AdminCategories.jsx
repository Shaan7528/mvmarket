import { DEFAULT_CATEGORIES } from '../../utils/constants'

export function AdminCategories() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Categories</h1>
      <p className="text-sm text-neutral-500 mb-4">
        Default categories are pre-configured. To add custom categories, create documents in the Firestore <code className="bg-neutral-100 px-1 rounded">categories</code> collection.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DEFAULT_CATEGORIES.map((cat) => (
          <div key={cat.id} className="p-4 bg-white rounded-2xl border border-neutral-100 text-center">
            <p className="font-semibold text-sm">{cat.name}</p>
            <p className="text-xs text-neutral-400 mt-1">{cat.id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
