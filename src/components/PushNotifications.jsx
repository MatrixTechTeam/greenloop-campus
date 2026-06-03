// src/components/PushNotifications.jsx
import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { requestNotificationPermission, onMessageListener } from '../services/notificationService';
import toast from 'react-hot-toast';

export default function PushNotifications() {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState('idle'); // idle, granted, denied, unsupported, loading
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    
    // Check current permission status
    if (Notification.permission === 'granted') {
      setStatus('granted');
    } else if (Notification.permission === 'denied') {
      setStatus('denied');
    } else {
      // Check if user dismissed banner before
      const dismissed = localStorage.getItem('notifications-dismissed');
      if (dismissed === 'true') {
        setShowBanner(false);
      }
      setStatus('idle');
    }
  }, [currentUser]);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log('Foreground notification:', payload);
        toast.success(payload.notification?.title || 'New Notification', {
          duration: 5000,
          icon: '🔔',
        });
      })
      .catch((err) => console.log('Failed to receive message', err));
    
    return () => unsubscribe?.();
  }, []);

  const requestPermission = async () => {
    if (!currentUser) return;
    
    setStatus('loading');
    try {
      const token = await requestNotificationPermission();
      if (token) {
        // Save token to Firestore
        await firebaseService.saveFCMToken(currentUser.uid, token);
        setStatus('granted');
        setShowBanner(false);
        toast.success('Notifications enabled! You will now receive updates.');
      } else {
        setStatus('denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setStatus('denied');
      toast.error('Failed to enable notifications');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notifications-dismissed', 'true');
  };

  // Don't show if already granted or unsupported or dismissed
  if (status === 'granted' || status === 'unsupported' || !showBanner) {
    return null;
  }

  // Don't show if user already denied once
  if (status === 'denied') {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm">
        <div className="glass rounded-2xl p-4 shadow-xl border border-gray-200 bg-white/95">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Bell size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Notifications Blocked</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Please enable notifications in your browser settings to receive updates.
              </p>
              <div className="flex gap-2 mt-3">
                <a
                  href="#"
                  onClick={() => {
                    window.open('chrome://settings/content/notifications', '_blank');
                  }}
                  className="text-xs text-primary-600 font-medium hover:underline"
                >
                  Open Settings
                </a>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Bell size={18} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Stay Updated! 🔔</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Get notified when your waste reports are verified and earn bonus points.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={requestPermission}
                disabled={status === 'loading'}
                className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Requesting...' : 'Allow Notifications'}
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}