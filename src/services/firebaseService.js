// src/services/firebaseService.js - Simplified version
import { 
  collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc,
  query, where, limit, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export const firebaseService = {
  async createUserProfile(userId, userData) {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      ecoPoints: 0,
      badge: 'Eco Rookie',
      createdAt: serverTimestamp(),
    });
  },

  async getUserProfile(userId) {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { uid: userId, ...docSnap.data() } : null;
  },

  async updateUserProfile(userId, data) {
    await updateDoc(doc(db, 'users', userId), data);
  },

  async updateUserPoints(userId, pointsToAdd) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const currentPoints = userDoc.data()?.ecoPoints || 0;
    const newPoints = currentPoints + pointsToAdd;
    await updateDoc(userRef, { ecoPoints: newPoints });
    return newPoints;
  },

  async createVerificationReport(data, imageFile) {
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `verifications/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    const docRef = await addDoc(collection(db, 'verificationReports'), {
      ...data, imageUrl, timestamp: serverTimestamp()
    });
    return { id: docRef.id };
  },

  async getVerificationHistory(userId) {
    const q = query(collection(db, 'verificationReports'), where('userId', '==', userId), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getMarketplaceListings() {
    const snapshot = await getDocs(collection(db, 'marketplace'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getUpcomingEvents() {
    const snapshot = await getDocs(collection(db, 'events'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getLeaderboard() {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    return users.sort((a, b) => (b.ecoPoints || 0) - (a.ecoPoints || 0)).slice(0, 50);
  },

  async getStatistics() {
    const users = await getDocs(collection(db, 'users'));
    const reports = await getDocs(collection(db, 'reports'));
    const verifications = await getDocs(collection(db, 'verificationReports'));
    const marketplace = await getDocs(collection(db, 'marketplace'));
    return {
      totalUsers: users.size,
      totalReports: reports.size,
      totalVerifications: verifications.size,
      totalMarketplaceItems: marketplace.size,
    };
  },

  async createWasteReport(data, imageFile) {
    const docRef = await addDoc(collection(db, 'reports'), { ...data, createdAt: serverTimestamp() });
    return { id: docRef.id };
  },

  async getMyListings(ownerId) {
    const q = query(collection(db, 'marketplace'), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getReports() {
    const snapshot = await getDocs(collection(db, 'reports'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createEvent(data) {
    const docRef = await addDoc(collection(db, 'events'), data);
    return { id: docRef.id };
  },

  async joinEvent(eventId, userId) {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    const participants = eventDoc.data()?.participants || [];
    if (!participants.includes(userId)) {
      await updateDoc(eventRef, { participants: [...participants, userId] });
    }
  },

  async createMarketplaceListing(data, imageFile) {
    let imageUrl = null;
    if (imageFile) {
      const storageRef = ref(storage, `marketplace/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    const docRef = await addDoc(collection(db, 'marketplace'), { ...data, imageUrl, createdAt: serverTimestamp() });
    return { id: docRef.id };
  },

  async claimListing(listingId, claimantId) {
    const listingRef = doc(db, 'marketplace', listingId);
    await updateDoc(listingRef, { status: 'claimed', claimantId, claimedAt: serverTimestamp() });
  },
};