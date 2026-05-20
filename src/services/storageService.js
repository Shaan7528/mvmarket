import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase/config'
import { compressImage } from '../utils/imageCompression'

export async function uploadImage(file, path) {
  const compressed = await compressImage(file)
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, compressed)
  return getDownloadURL(storageRef)
}

export async function uploadImages(files, basePath) {
  const urls = []
  for (let i = 0; i < files.length; i++) {
    const url = await uploadImage(files[i], `${basePath}/${Date.now()}_${i}.jpg`)
    urls.push(url)
  }
  return urls
}
