// src/services/notificationService.js
import { messaging } from '../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';

// VAPID key from Firebase Console
// Go to Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

// Check if notifications are supported
export const isNotificationSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

// Register service worker
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported');
    return null;
  }

  if (!messaging) {
    console.log('Firebase messaging not initialized');
    return null;
  }

  try {
    // Register service worker first
    await registerServiceWorker();
    
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('FCM Token obtained:', token);
      // Store token in localStorage
      localStorage.setItem('fcm_token', token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!messaging) {
    console.log('Firebase messaging not initialized');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });
};

// Send test notification (for debugging)
export const sendTestNotification = () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification('GreenLoop Test Notification', {
      body: 'This is a test notification from GreenLoop!',
      icon: '/leaf-icon.png',
      vibrate: [200, 100, 200],
    });
  } else {
    console.log('Notification permission not granted');
  }
};

// Check notification permission status
export const getNotificationPermissionStatus = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};