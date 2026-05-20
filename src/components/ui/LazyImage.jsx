import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export function LazyImage({ src, alt, className = '', fallbackClassName = '' }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 ${fallbackClassName || className}`}>
        <ImageOff className="w-8 h-8 text-neutral-300" />
      </div>
    )
  }

  return (
    <>
      {!loaded && <div className={`skeleton absolute inset-0 ${className}`} />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  )
}
