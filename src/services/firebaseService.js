import { 
  collection, addDoc, getDocs, query, where, orderBy, limit,
  updateDoc, deleteDoc, doc, getDoc, setDoc, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase'; // ← removed storage import

// Helper: convert File to base64 string
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result); // returns "data:image/jpeg;base64,..."
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const firebaseService = {
  // ============ USER MANAGEMENT ============
  async createUserProfile(userId, userData) {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      ecoPoints: 0,
      badge: 'Eco Rookie',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });
  },

  async getUserProfile(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) return { uid: userId, ...userDoc.data() };
    return null;
  },

  async updateUserProfile(userId, data) {
    await updateDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() });
  },

  async updateUserPoints(userId, pointsToAdd) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const currentPoints = userDoc.data()?.ecoPoints || 0;
    const newPoints = currentPoints + pointsToAdd;
    const badge = this.getBadge(newPoints);
    await updateDoc(userRef, { 
      ecoPoints: newPoints, badge, 
      updatedAt: serverTimestamp(), lastActive: serverTimestamp() 
    });
    return { newPoints, badge };
  },

  getBadge(points) {
    if (points >= 1000) return '🏆 Campus Legend';
    if (points >= 500) return '🌟 Sustainability Leader';
    if (points >= 250) return '💚 Green Champion';
    if (points >= 100) return '⭐ Eco Hero';
    if (points >= 50) return '🌱 Eco Explorer';
    return '🌿 Eco Rookie';
  },

  // ============ WASTE REPORTS ============
  async createWasteReport(reportData, imageFile) {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await fileToBase64(imageFile); // ← base64 instead of Storage
    }
    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData, imageUrl, status: 'pending', createdAt: serverTimestamp()
    });
    if (reportData.pointsEarned) {
      await this.updateUserPoints(reportData.userId, reportData.pointsEarned);
    }
    return { id: docRef.id };
  },

  async getReports() {
    const snapshot = await getDocs(collection(db, 'reports'));
    const reports = snapshot.docs.map(doc => ({ 
      id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() 
    }));
    return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async updateReportStatus(reportId, status) {
    await updateDoc(doc(db, 'reports', reportId), { status, updatedAt: serverTimestamp() });
  },

  async deleteReport(reportId) {
    await deleteDoc(doc(db, 'reports', reportId));
  },

  // ============ VERIFICATION REPORTS ============
  async createVerificationReport(verificationData, imageFile) {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await fileToBase64(imageFile); // ← base64 instead of Storage
    }
    const docRef = await addDoc(collection(db, 'verificationReports'), {
      ...verificationData, imageUrl, timestamp: serverTimestamp()
    });
    if (verificationData.ecoPointsAwarded) {
      await this.updateUserPoints(verificationData.userId, verificationData.ecoPointsAwarded);
    }
    return { id: docRef.id };
  },

  async getVerificationHistory(userId, limitCount = 20) {
    const q = query(
      collection(db, 'verificationReports'),
      where('userId', '==', userId),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate(),
    }));
    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getAllVerifications() {
    const snapshot = await getDocs(collection(db, 'verificationReports'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() 
    }));
  },

  // ============ MARKETPLACE ============
  async createMarketplaceListing(listingData, imageFile) {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await fileToBase64(imageFile); // ← base64 instead of Storage
    }
    const docRef = await addDoc(collection(db, 'marketplace'), {
      ...listingData, imageUrl, status: 'available', createdAt: serverTimestamp()
    });
    return { id: docRef.id };
  },

  async getMarketplaceListings() {
    const q = query(collection(db, 'marketplace'), where('status', '==', 'available'));
    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map(doc => ({ 
      id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() 
    }));
    for (const listing of listings) {
      const owner = await this.getUserProfile(listing.ownerId);
      listing.ownerName = owner?.fullname || 'Unknown';
    }
    return listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getMyListings(ownerId) {
    const q = query(collection(db, 'marketplace'), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map(doc => ({ 
      id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() 
    }));
    return listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async claimListing(listingId, claimantId) {
    const listingRef = doc(db, 'marketplace', listingId);
    const listingDoc = await getDoc(listingRef);
    const listing = listingDoc.data();
    if (listing.status !== 'available') throw new Error('Item no longer available');
    await updateDoc(listingRef, { status: 'claimed', claimantId, claimedAt: serverTimestamp() });
    await this.updateUserPoints(claimantId, 5);
    await this.updateUserPoints(listing.ownerId, 10);
    await this.createNotification(claimantId, 'Item Claimed', `You claimed ${listing.title}`);
    await this.createNotification(listing.ownerId, 'Item Claimed', `Your ${listing.title} was claimed`);
    return true;
  },

  async deleteListing(listingId) {
    // No Storage cleanup needed — image is just a base64 field in Firestore
    await deleteDoc(doc(db, 'marketplace', listingId));
  },

  // ============ EVENTS ============
  async createEvent(eventData) {
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData, participants: [], createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  },

  async getAllEvents() {
    const snapshot = await getDocs(collection(db, 'events'));
    return snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  },

  async getUpcomingEvents() {
    const now = new Date();
    const snapshot = await getDocs(collection(db, 'events'));
    const events = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data(), date: doc.data().date?.toDate(),
    }));
    return events.filter(e => e.date >= now).sort((a, b) => a.date - b.date).slice(0, 20);
  },

  async updateEvent(eventId, eventData) {
    await updateDoc(doc(db, 'events', eventId), { ...eventData, updatedAt: serverTimestamp() });
  },

  async deleteEvent(eventId) {
    await deleteDoc(doc(db, 'events', eventId));
  },

  async joinEvent(eventId, userId) {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    const participants = eventDoc.data()?.participants || [];
    if (!participants.includes(userId)) {
      await updateDoc(eventRef, { participants: [...participants, userId], updatedAt: serverTimestamp() });
      await this.updateUserPoints(userId, 25);
      await this.createNotification(userId, 'Event Joined', `You joined ${eventDoc.data()?.title}`);
      return true;
    }
    return false;
  },

  // ============ NOTIFICATIONS ============
  async createNotification(userId, title, message, type = 'info') {
    try {
      await addDoc(collection(db, 'notifications'), { 
        userId, title, message, type, read: false, createdAt: serverTimestamp() 
      });
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  },

  async getUserNotifications(userId) {
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({ 
        id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() 
      }));
      return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  async markNotificationRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
      return true;
    } catch (error) {
      console.error('Error marking notification read:', error);
      return false;
    }
  },

  async markAllNotificationsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId), 
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnapshot => batch.update(docSnapshot.ref, { read: true }));
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      return false;
    }
  },

  // ============ LEADERBOARD ============
  async getLeaderboard(limitCount = 50) {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    return users
      .sort((a, b) => (b.ecoPoints || 0) - (a.ecoPoints || 0))
      .slice(0, limitCount)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  },

  async getDepartmentLeaderboard() {
    const snapshot = await getDocs(collection(db, 'users'));
    const departments = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.department) {
        if (!departments[data.department]) {
          departments[data.department] = { totalPoints: 0, count: 0 };
        }
        departments[data.department].totalPoints += data.ecoPoints || 0;
        departments[data.department].count += 1;
      }
    });
    return Object.entries(departments)
      .map(([name, data]) => ({
        name,
        averagePoints: data.totalPoints / data.count,
        totalPoints: data.totalPoints,
        memberCount: data.count,
      }))
      .sort((a, b) => b.averagePoints - a.averagePoints);
  },

  // ============ STATISTICS ============
  async getStatistics() {
    const [usersSnapshot, reportsSnapshot, verificationsSnapshot, marketplaceSnapshot, eventsSnapshot] = 
      await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'reports')),
        getDocs(collection(db, 'verificationReports')),
        getDocs(collection(db, 'marketplace')),
        getDocs(collection(db, 'events'))
      ]);
    
    let totalEcoPoints = 0, totalRecycled = 0, totalUpcycled = 0, pendingReports = 0, availableItems = 0;
    
    usersSnapshot.forEach(doc => { totalEcoPoints += doc.data().ecoPoints || 0; });
    verificationsSnapshot.forEach(doc => {
      const status = doc.data().selectedStatus;
      if (status === 'Recycled') totalRecycled++;
      if (status === 'Upcycled') totalUpcycled++;
    });
    reportsSnapshot.forEach(doc => { if (doc.data().status === 'pending') pendingReports++; });
    marketplaceSnapshot.forEach(doc => { if (doc.data().status === 'available') availableItems++; });
    
    return {
      totalUsers: usersSnapshot.size, totalReports: reportsSnapshot.size,
      totalVerifications: verificationsSnapshot.size, totalMarketplaceItems: marketplaceSnapshot.size,
      totalEvents: eventsSnapshot.size, totalEcoPoints, totalRecycled, totalUpcycled,
      pendingReports, availableItems,
    };
  },

  // ============ FCM TOKEN MANAGEMENT ============
  async saveFCMToken(userId, token) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const existingTokens = userDoc.data()?.fcmTokens || [];
      if (!existingTokens.includes(token)) {
        await updateDoc(userRef, { fcmTokens: [...existingTokens, token], updatedAt: serverTimestamp() });
      }
      return true;
    } catch (error) {
      console.error('Error saving FCM token:', error);
      return false;
    }
  },

  async removeFCMToken(userId, token) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const existingTokens = userDoc.data()?.fcmTokens || [];
      await updateDoc(userRef, {
        fcmTokens: existingTokens.filter(t => t !== token),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error removing FCM token:', error);
      return false;
    }
  },
};

export default firebaseService;