import { useRef, useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { LazyImage } from './ui/LazyImage'

function normalizeImages(images) {
  if (!images?.length) return []
  return images.map((img) =>
    typeof img === 'string' ? { url: img, isNew: false } : img
  )
}

export function ImageUploader({
  images = [],
  onChange,
  maxImages = 5,
  label = 'Upload images',
}) {
  const inputRef = useRef(null)
  const [previews, setPreviews] = useState(() => normalizeImages(images))

  const imageKey = images
    ?.map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean)
    .join('|')

  useEffect(() => {
    setPreviews(normalizeImages(images))
  }, [imageKey])

  const handleFiles = (files) => {
    const remaining = maxImages - previews.length
    const selected = Array.from(files).slice(0, remaining)
    const newPreviews = [
      ...previews,
      ...selected.map((f) => ({ url: URL.createObjectURL(f), file: f, isNew: true })),
    ]
    setPreviews(newPreviews)
    onChange?.(newPreviews)
  }

  const removeImage = (index) => {
    const updated = previews.filter((_, i) => i !== index)
    setPreviews(updated)
    onChange?.(updated)
  }

  return (
    <div>
      <label className="text-sm font-medium text-neutral-700 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {previews.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100">
            <LazyImage src={img.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {previews.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1 hover:border-neutral-400 transition-colors"
          >
            <Upload className="w-5 h-5 text-neutral-400" />
            <span className="text-[10px] text-neutral-400">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {previews.length === 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
          <ImageIcon className="w-4 h-4" />
          JPG, PNG up to 5 images. Auto-compressed on upload.
        </div>
      )}
    </div>
  )
}
