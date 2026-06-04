// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { firebaseService } from "../services/firebaseService";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          let profile = await firebaseService.getUserProfile(user.uid);
          if (!profile) {
            profile = {
              fullname: user.displayName || user.email.split("@")[0],
              email: user.email,
              role: "student",
              ecoPoints: 0,
              badge: "Eco Rookie",
              profilePicture: user.photoURL || null,
            };
            await firebaseService.createUserProfile(user.uid, profile);
          }
          setUserProfile(profile);
          setUserRole(profile.role || "student");
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setUserProfile(null);
        setUserRole("student");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (
    email,
    password,
    fullname,
    department = "",
    faculty = "",
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: fullname });
      await firebaseService.createUserProfile(userCredential.user.uid, {
        fullname,
        email,
        department,
        faculty,
        role: "student",
        ecoPoints: 0,
        badge: "Eco Rookie",
      });
      toast.success("Account created successfully! Please verify your email.");
      return userCredential.user;
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please login instead.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Use at least 6 characters.");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      toast.success(
        `Welcome back, ${userCredential.user.displayName || "Student"}!`,
      );
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-credential") {
        toast.error(
          "Invalid email or password. Please try again or create an account.",
        );
      } else if (error.code === "auth/user-not-found") {
        toast.error(
          "No account found with this email. Please create an account.",
        );
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Please try again later.");
      } else {
        toast.error("Login failed. Please try again.");
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Welcome, ${result.user.displayName || "Student"}!`);
      return result.user;
    } catch (error) {
      console.error("Google login error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else {
        toast.error("Google sign-in failed. Please try again.");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email address.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    if (currentUser && userProfile) {
      try {
        const updated = { ...userProfile, ...data };
        await firebaseService.updateUserProfile(currentUser.uid, updated);
        setUserProfile(updated);
        toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Update profile error:", error);
        toast.error("Failed to update profile. Please try again.");
        throw error;
      }
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    isAdmin: userRole === "admin",
    isVolunteer: userRole === "volunteer" || userRole === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
