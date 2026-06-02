import { db, storage } from '../config/firebase'
import {
  collection, addDoc, getDocs, getDoc,
  doc, updateDoc, query, where, orderBy, limit
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const submitWasteReport = async (reportData) => {
  return await addDoc(collection(db, 'wasteReports'), {
    ...reportData,
    createdAt: new Date(),
    status: 'pending',
  })
}

export const getWasteReports = async () => {
  const snapshot = await getDocs(collection(db, 'wasteReports'))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getUserPoints = async (userId) => {
  const docRef = doc(db, 'users', userId)
  const snap = await getDoc(docRef)
  return snap.exists() ? snap.data().ecoPoints ?? 0 : 0
}

export const addEcoPoints = async (userId, points) => {
  const docRef = doc(db, 'users', userId)
  const snap = await getDoc(docRef)
  const current = snap.exists() ? snap.data().ecoPoints ?? 0 : 0
  return await updateDoc(docRef, { ecoPoints: current + points })
}

export const getLeaderboard = async (limitCount = 10) => {
  const q = query(collection(db, 'users'), orderBy('ecoPoints', 'desc'), limit(limitCount))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}

export const getMarketplaceItems = async () => {
  const snapshot = await getDocs(collection(db, 'marketplace'))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getEvents = async () => {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// --- User Reports (for Carbon Tracker) ---
export const getUserReports = async (userId) => {
  const q = query(collection(db, 'wasteReports'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// --- Weekly Challenges ---
export const getWeeklyChallenges = async () => {
  const snapshot = await getDocs(collection(db, 'weeklyChallenges'))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getUserChallengeProgress = async (userId) => {
  const docRef = doc(db, 'users', userId)
  const snap = await getDoc(docRef)
  return snap.exists() ? snap.data().challengeProgress ?? {} : {}
}

export const updateChallengeProgress = async (userId, challengeId, value) => {
  const docRef = doc(db, 'users', userId)
  return await updateDoc(docRef, {
    [`challengeProgress.${challengeId}`]: value,
  })
}

// --- FCM Token ---
export const saveFCMToken = async (userId, token) => {
  const docRef = doc(db, 'users', userId)
  return await updateDoc(docRef, { fcmToken: token })
}
