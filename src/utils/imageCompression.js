import imageCompression from 'browser-image-compression'

const defaultOptions = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: 'image/jpeg',
}

export async function compressImage(file, options = {}) {
  if (!file || !file.type?.startsWith('image/')) return file
  try {
    const compressed = await imageCompression(file, { ...defaultOptions, ...options })
    return compressed
  } catch {
    return file
  }
}

export async function compressImages(files, options = {}) {
  return Promise.all(files.map((f) => compressImage(f, options)))
}
