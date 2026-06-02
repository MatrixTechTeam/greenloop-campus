import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import app from '../config/firebase'

const messaging = getMessaging(app)

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })
    return token
  } catch (err) {
    console.error('FCM token error:', err)
    return null
  }
}

export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}
