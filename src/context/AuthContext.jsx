// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { firebaseService } from '../services/firebaseService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          let profile = await firebaseService.getUserProfile(user.uid);
          if (!profile) {
            profile = {
              fullname: user.displayName || user.email.split('@')[0],
              email: user.email,
              role: 'student',
              ecoPoints: 0,
              badge: 'Eco Rookie',
              profilePicture: user.photoURL || null,
            };
            await firebaseService.createUserProfile(user.uid, profile);
          }
          setUserProfile(profile);
          setUserRole(profile.role || 'student');
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
        setUserRole('student');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email, password, fullname, department = '', faculty = '') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullname });
      await firebaseService.createUserProfile(userCredential.user.uid, {
        fullname, email, department, faculty, role: 'student', ecoPoints: 0, badge: 'Eco Rookie',
      });
      toast.success('Account created successfully!');
      return userCredential.user;
    } catch (error) {
      toast.error('Failed to create account');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Welcome back!`);
      return userCredential.user;
    } catch (error) {
      toast.error('Login failed');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Welcome!`);
      return result.user;
    } catch (error) {
      toast.error('Google login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Password reset failed');
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    if (currentUser && userProfile) {
      const updated = { ...userProfile, ...data };
      await firebaseService.updateUserProfile(currentUser.uid, updated);
      setUserProfile(updated);
      toast.success('Profile updated!');
    }
  };

  const value = {
    currentUser, userProfile, userRole, loading,
    signup, login, loginWithGoogle, logout, resetPassword, updateUserProfile,
    isAdmin: userRole === 'admin',
    isVolunteer: userRole === 'volunteer' || userRole === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};