import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, query, where, getDocs, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { COLLECTIONS, ROLES } from '../utils/constants'

const googleProvider = new GoogleAuthProvider()

export async function registerWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  await createUserDoc(cred.user, { displayName })
  return cred.user
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  const existing = await getUserDoc(cred.user.uid)
  if (!existing) {
    await createUserDoc(cred.user, {
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL,
    })
  }
  return cred.user
}

export async function logout() {
  await signOut(auth)
}

async function createUserDoc(user, extra = {}) {
  const ref = doc(db, COLLECTIONS.USERS, user.uid)
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: extra.displayName || user.displayName || '',
    username: '',
    photoURL: extra.photoURL || user.photoURL || null,
    role: ROLES.CUSTOMER,
    phone: null,
    island: null,
    storeId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, COLLECTIONS.USERS, uid)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function checkUsernameAvailable(username) {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('username', '==', username.toLowerCase())
  )
  const snap = await getDocs(q)
  return snap.empty
}

export async function setUsername(uid, username) {
  const lower = username.toLowerCase().trim()
  const available = await checkUsernameAvailable(lower)
  if (!available) throw new Error('Username already taken')
  await updateUserProfile(uid, { username: lower })
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: auth.currentUser.displayName })
  }
  return lower
}

export async function upgradeToSeller(uid) {
  await updateUserProfile(uid, { role: ROLES.SELLER })
}
