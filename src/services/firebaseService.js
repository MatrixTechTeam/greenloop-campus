// src/services/firebaseService.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Helper to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const firebaseService = {
  // User Profile methods
  getUserProfile: async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid: userId, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  },

  createUserProfile: async (userId, profileData) => {
    try {
      const docRef = doc(db, "users", userId);
      await setDoc(docRef, {
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { uid: userId, ...profileData };
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (userId, data) => {
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  updateUserPoints: async (userId, pointsToAdd) => {
    try {
      const userProfile = await firebaseService.getUserProfile(userId);
      const currentPoints = userProfile?.ecoPoints || 0;
      const newPoints = currentPoints + pointsToAdd;

      let badge = "Eco Rookie";
      if (newPoints >= 1000) badge = "Campus Legend";
      else if (newPoints >= 500) badge = "Sustainability Leader";
      else if (newPoints >= 250) badge = "Green Champion";
      else if (newPoints >= 100) badge = "Eco Hero";
      else if (newPoints >= 50) badge = "Eco Explorer";

      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        ecoPoints: newPoints,
        badge: badge,
        updatedAt: new Date().toISOString(),
      });
      return { ecoPoints: newPoints, badge };
    } catch (error) {
      console.error("Error updating points:", error);
      throw error;
    }
  },

  // Verification Reports - Store image as base64 (no CORS issues)
  createVerificationReport: async (data, imageFile) => {
    try {
      let imageBase64 = null;
      if (imageFile) {
        try {
          imageBase64 = await fileToBase64(imageFile);
        } catch (imgError) {
          console.error("Error converting image to base64:", imgError);
        }
      }

      const reportData = {
        ...data,
        imageBase64, // Store directly in Firestore
        timestamp: new Date().toISOString(),
        status: "verified",
      };

      const docRef = await addDoc(
        collection(db, "verificationReports"),
        reportData,
      );
      return { id: docRef.id, ...reportData };
    } catch (error) {
      console.error("Error creating verification report:", error);
      throw error;
    }
  },

  getVerificationHistory: async (userId) => {
    try {
      const q = query(
        collection(db, "verificationReports"),
        where("userId", "==", userId),
      );
      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return results;
    } catch (error) {
      console.error("Error getting verification history:", error);
      return [];
    }
  },

  // Waste Reports - Store image as base64
  createWasteReport: async (data, imageFile) => {
    try {
      let imageBase64 = null;
      if (imageFile) {
        try {
          imageBase64 = await fileToBase64(imageFile);
        } catch (imgError) {
          console.error("Error converting image to base64:", imgError);
        }
      }

      const reportData = {
        ...data,
        imageBase64,
        createdAt: Timestamp.now(),
        status: "pending",
      };

      const docRef = await addDoc(collection(db, "reports"), reportData);
      return { id: docRef.id, ...reportData };
    } catch (error) {
      console.error("Error creating waste report:", error);
      throw error;
    }
  },

  getReports: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      let results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
      return results;
    } catch (error) {
      console.error("Error getting reports:", error);
      return [];
    }
  },

  // Marketplace Listings - Store image as base64
  getMarketplaceListings: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "marketplace"));
      let results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
      return results;
    } catch (error) {
      console.error("Error getting marketplace listings:", error);
      return [];
    }
  },

  createMarketplaceListing: async (data, imageFile) => {
    try {
      let imageBase64 = null;
      if (imageFile) {
        try {
          imageBase64 = await fileToBase64(imageFile);
        } catch (imgError) {
          console.error("Error converting image to base64:", imgError);
        }
      }

      const listingData = {
        ...data,
        imageBase64,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "marketplace"), listingData);
      return { id: docRef.id, ...listingData };
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      throw error;
    }
  },

  getMyListings: async (userId) => {
    try {
      const q = query(
        collection(db, "marketplace"),
        where("ownerId", "==", userId),
      );
      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
      return results;
    } catch (error) {
      console.error("Error getting my listings:", error);
      return [];
    }
  },

  claimListing: async (listingId, userId) => {
    try {
      const listingRef = doc(db, "marketplace", listingId);
      await updateDoc(listingRef, {
        status: "claimed",
        claimedBy: userId,
        claimedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error claiming listing:", error);
      throw error;
    }
  },

  deleteListing: async (listingId) => {
    try {
      await deleteDoc(doc(db, "marketplace", listingId));
      return true;
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw error;
    }
  },

  // Events
  getUpcomingEvents: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      let results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      results.sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date);
        const dateB = b.date?.toDate?.() || new Date(b.date);
        return dateA - dateB;
      });
      return results;
    } catch (error) {
      console.error("Error getting events:", error);
      return [];
    }
  },

  joinEvent: async (eventId, userId) => {
    try {
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const participants = eventSnap.data().participants || [];
        if (!participants.includes(userId)) {
          participants.push(userId);
          await updateDoc(eventRef, { participants });
          await firebaseService.updateUserPoints(userId, 25);
        }
      }
      return true;
    } catch (error) {
      console.error("Error joining event:", error);
      throw error;
    }
  },

  // Leaderboard
  getLeaderboard: async (limitCount = 100) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      let results = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      results.sort((a, b) => (b.ecoPoints || 0) - (a.ecoPoints || 0));
      return results.slice(0, limitCount);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return [];
    }
  },

  // Notifications
  getUserNotifications: async (userId) => {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
      );
      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      results.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
      return results.slice(0, 50);
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const notifRef = doc(db, "notifications", notificationId);
      await updateDoc(notifRef, { read: true });
      return true;
    } catch (error) {
      console.error("Error marking notification read:", error);
      throw error;
    }
  },

  markAllNotificationsRead: async (userId) => {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false),
      );
      const querySnapshot = await getDocs(q);
      const updates = querySnapshot.docs.map((doc) =>
        updateDoc(doc.ref, { read: true }),
      );
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const verificationsSnapshot = await getDocs(
        collection(db, "verificationReports"),
      );
      const marketplaceSnapshot = await getDocs(collection(db, "marketplace"));

      return {
        totalUsers: usersSnapshot.size,
        totalVerifications: verificationsSnapshot.size,
        totalMarketplaceItems: marketplaceSnapshot.size,
        totalReports: 0,
      };
    } catch (error) {
      console.error("Error getting statistics:", error);
      return {
        totalUsers: 0,
        totalVerifications: 0,
        totalMarketplaceItems: 0,
        totalReports: 0,
      };
    }
  },
};
