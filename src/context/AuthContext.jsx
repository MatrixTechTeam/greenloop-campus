import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { firebaseService } from '../services/firebaseService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('student')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          let profile = await firebaseService.getUserProfile(user.uid)
          if (!profile) {
            profile = {
              fullname: user.displayName || user.email.split('@')[0],
              email: user.email,
              role: 'student',
              ecoPoints: 0,
              badge: 'Eco Rookie',
              profilePicture: user.photoURL || null,
            }
            await firebaseService.createUserProfile(user.uid, profile)
          }
          setUserProfile(profile)
          setUserRole(profile.role || 'student')
        } catch (error) {
          console.error('Error loading user profile:', error)
        }
      } else {
        setUserProfile(null)
        setUserRole('student')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signup = async (email, password, fullname, department = '', faculty = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName: fullname })
    await firebaseService.createUserProfile(userCredential.user.uid, {
      fullname, email, department, faculty, role: 'student', ecoPoints: 0, badge: 'Eco Rookie',
    })
    return userCredential.user
  }

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email)
  }

  const updateUserProfile = async (data) => {
    if (currentUser && userProfile) {
      const updated = { ...userProfile, ...data }
      await firebaseService.updateUserProfile(currentUser.uid, updated)
      setUserProfile(updated)
    }
  }

  const value = {
    currentUser, userProfile, userRole, loading,
    signup, login, loginWithGoogle, logout, resetPassword, updateUserProfile,
    isAdmin: userRole === 'admin',
    isVolunteer: userRole === 'volunteer' || userRole === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}