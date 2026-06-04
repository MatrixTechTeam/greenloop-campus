// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  signInWithCustomToken,
  getRedirectResult,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { auth, googleProvider, db } from "../config/firebase";
import { firebaseService } from "../services/firebaseService";
import toast from "react-hot-toast";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ─── Environment helpers ─────────────────────────────────────────────────────

export const isWebView = () => {
  const ua = navigator.userAgent || "";
  if (/wv/.test(ua) && /Android/.test(ua)) return true;
  if (
    /iPhone|iPad|iPod/.test(ua) &&
    !/Safari/.test(ua) &&
    /AppleWebKit/.test(ua)
  )
    return true;
  if (
    /FBAN|FBAV|Instagram|Twitter|LinkedIn|Snapchat|TikTok|Line|WhatsApp/.test(
      ua,
    )
  )
    return true;
  if (/WebView/.test(ua)) return true;
  return false;
};

export const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * Generates a random session ID used to link the APK polling instance
 * with the Chrome tab that completes the OAuth flow.
 */
const generateSessionId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Opens a URL in the device's default browser (Chrome on most Androids).
 * Uses Android Intent URL which escapes the WebView entirely.
 */
export const openInChrome = (url) => {
  const intentUrl =
    `intent://${url.replace(/^https?:\/\//, "")}` +
    `#Intent;scheme=https;action=android.intent.action.VIEW;` +
    `package=com.android.chrome;end`;

  const a = document.createElement("a");
  a.href = intentUrl;
  a.click();

  // Fallback after 1.5 s for devices without Chrome
  setTimeout(() => {
    window.location.href = url;
  }, 1500);
};

// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("student");

  // Ref to hold the Firestore unsubscribe for APK session polling
  const pollUnsubRef = useRef(null);

  // ── Handle redirect result (fires when Chrome redirects back) ─────────────
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          toast.success(`Welcome, ${result.user.displayName || "Student"}!`);
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        }
      } catch (error) {
        const ignored = [
          "auth/popup-closed-by-user",
          "auth/redirect-cancelled-by-user",
          "auth/null-user",
        ];
        if (!ignored.includes(error.code)) {
          toast.error("Google sign-in failed. Please try again.");
        }
      }
    };
    handleRedirectResult();
  }, []);

  // ── Auth state listener with console logging and redirect ─────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AUTH STATE:", user);

      if (user) {
        console.log("USER UID:", user.uid);
        console.log("USER EMAIL:", user.email);
        console.log("USER DISPLAY NAME:", user.displayName);

        setCurrentUser(user);

        try {
          let profile = await firebaseService.getUserProfile(user.uid);
          if (!profile) {
            console.log("No profile found, creating new profile...");
            profile = {
              fullname: user.displayName || user.email.split("@")[0],
              email: user.email,
              role: "student",
              ecoPoints: 0,
              badge: "Eco Rookie",
              profilePicture: user.photoURL || null,
            };
            await firebaseService.createUserProfile(user.uid, profile);
            console.log("Profile created successfully");
          } else {
            console.log("Profile found:", profile);
          }
          setUserProfile(profile);
          setUserRole(profile.role || "student");

          // Redirect to dashboard after successful login
          const currentPath = window.location.pathname;
          console.log("Current path:", currentPath);

          if (
            currentPath !== "/dashboard" &&
            currentPath !== "/auth-callback"
          ) {
            console.log("Redirecting to /dashboard...");
            window.location.href = "/dashboard";
          } else {
            console.log(
              "Already on dashboard or auth-callback, skipping redirect",
            );
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        console.log("NO USER FOUND - User is not logged in");
        setCurrentUser(null);
        setUserProfile(null);
        setUserRole("student");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Cleanup poll on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollUnsubRef.current) pollUnsubRef.current();
    };
  }, []);

  // ── Auth methods ───────────────────────────────────────────────────────────

  const signup = async (
    email,
    password,
    fullname,
    department = "",
    faculty = "",
  ) => {
    try {
      console.log("Signing up user:", email);
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
      console.log("Signup successful for:", fullname);
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
      console.log("Logging in user:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("Login successful for:", userCredential.user.uid);
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

  /**
   * loginWithGoogle — three-tier strategy:
   *
   * Tier 1 (WebView / APK):
   *   - Generate a session ID
   *   - Open Chrome with /auth-callback?session=<id>
   *   - Start polling Firestore for apk_auth_sessions/<id>
   *   - When Chrome writes the session doc, read it and sign in via
   *     signInWithCustomToken (requires a Cloud Function) OR reconstruct
   *     the session by signing in with the stored uid directly via
   *     a lightweight custom flow.
   *
   * Tier 2 (Mobile real browser): redirect
   * Tier 3 (Desktop): popup → redirect fallback
   */
  const loginWithGoogle = async (onPollingStart) => {
    // ── Tier 1: WebView ───────────────────────────────────────────────────
    if (isWebView()) {
      console.log("WebView detected, using Chrome redirect flow");
      const sessionId = generateSessionId();

      // Store locally so we can clean up if needed
      sessionStorage.setItem("apkSessionId", sessionId);

      // Build the callback URL on your hosted site
      const callbackUrl = `${window.location.origin}/auth-callback?session=${sessionId}`;

      // Notify the UI that we're now polling (shows a spinner/message)
      if (typeof onPollingStart === "function") onPollingStart(sessionId);

      // Open Chrome
      console.log("Opening Chrome with URL:", callbackUrl);
      openInChrome(callbackUrl);

      // Poll Firestore: watch apk_auth_sessions/<sessionId>
      // The AuthCallback page writes this doc after successful Google sign-in
      return new Promise((resolve, reject) => {
        const sessionRef = doc(db, "apk_auth_sessions", sessionId);
        const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

        const timeoutId = setTimeout(() => {
          console.log("Polling timeout after 5 minutes");
          if (pollUnsubRef.current) pollUnsubRef.current();
          reject(new Error("auth/timeout"));
          toast.error("Sign-in timed out. Please try again.");
        }, TIMEOUT_MS);

        pollUnsubRef.current = onSnapshot(
          sessionRef,
          async (snap) => {
            if (!snap.exists()) {
              console.log("Waiting for session document...");
              return;
            }

            console.log("Session document found!");
            clearTimeout(timeoutId);
            if (pollUnsubRef.current) pollUnsubRef.current();

            const data = snap.data();
            console.log("Session data:", data);

            // Guard: reject expired sessions
            if (data.expiresAt && Date.now() > data.expiresAt) {
              console.log("Session expired");
              await deleteDoc(sessionRef).catch(() => {});
              reject(new Error("auth/session-expired"));
              toast.error("Session expired. Please try again.");
              return;
            }

            try {
              // Clean up the session document
              await deleteDoc(sessionRef).catch(() => {});

              // Get user profile
              const profile = await firebaseService.getUserProfile(data.uid);
              if (profile) {
                console.log("Profile found for user:", data.uid);
                setUserProfile(profile);
                setUserRole(profile.role || "student");
                toast.success(`Welcome, ${data.displayName || "Student"}!`);
                resolve({ uid: data.uid, ...profile });
              } else {
                console.error("Profile not found for user:", data.uid);
                throw new Error("Profile not found");
              }
            } catch (err) {
              console.error("Session restore error:", err);
              toast.error("Sign-in failed. Please try again.");
              reject(err);
            }
          },
          (err) => {
            clearTimeout(timeoutId);
            console.error("Firestore poll error:", err);
            toast.error("Sign-in failed. Please try again.");
            reject(err);
          },
        );
      });
    }

    // ── Tier 2: Mobile real browser — use redirect ────────────────────────
    if (isMobileDevice()) {
      console.log("Mobile browser detected, using redirect flow");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (error) {
        console.error("Redirect error:", error);
        toast.error("Google sign-in failed. Please try again.");
        throw error;
      }
    }

    // ── Tier 3: Desktop — popup with redirect fallback ────────────────────
    console.log("Desktop detected, using popup flow");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Popup sign-in successful for:", result.user.uid);
      toast.success(`Welcome, ${result.user.displayName || "Student"}!`);
      return result.user;
    } catch (error) {
      console.error("Popup error:", error);
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        console.log("Popup blocked, falling back to redirect");
        toast("Popup blocked — redirecting to Google sign-in…", { icon: "🔄" });
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      toast.error("Google sign-in failed. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user");
      await signOut(auth);
      console.log("Logout successful");
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const resetPassword = async (email) => {
    try {
      console.log("Sending password reset email to:", email);
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
        console.log("Updating user profile for:", currentUser.uid);
        const updated = { ...userProfile, ...data };
        await firebaseService.updateUserProfile(currentUser.uid, updated);
        setUserProfile(updated);
        console.log("Profile updated successfully");
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
