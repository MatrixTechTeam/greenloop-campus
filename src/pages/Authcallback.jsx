// src/pages/AuthCallback.jsx
// This page lives on your hosted site (e.g. https://yourapp.vercel.app/auth-callback)
// It is opened in Chrome by the APK, completes Google sign-in, then saves
// the auth token to Firestore so the APK can pick it up.

import React, { useEffect, useState } from "react";
import { getRedirectResult, signInWithRedirect, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../config/firebase";
import { firebaseService } from "../services/firebaseService";
import { Leaf, CheckCircle, Loader, AlertTriangle } from "lucide-react";

const STATUS = {
  CHECKING: "checking",
  SIGNING_IN: "signing_in",
  SUCCESS: "success",
  ERROR: "error",
};

const AuthCallback = () => {
  const [status, setStatus] = useState(STATUS.CHECKING);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        // ── Step 1: Check if returning from Google redirect ──────────────
        const result = await getRedirectResult(auth);

        if (result?.user) {
          // ── Step 2: Ensure user profile exists in Firestore ─────────────
          const user = result.user;
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

          // ── Step 3: Get the ID token and write a short-lived auth session
          //    document to Firestore. The APK polls this document.         ──
          const idToken = await user.getIdToken();
          const sessionId = sessionStorage.getItem("apkSessionId") || "";

          if (sessionId) {
            await setDoc(doc(db, "apk_auth_sessions", sessionId), {
              uid: user.uid,
              idToken,
              email: user.email,
              displayName: user.displayName || profile.fullname,
              photoURL: user.photoURL || null,
              createdAt: serverTimestamp(),
              // Auto-expire after 5 minutes (your Cloud Function or
              // client-side cleanup can delete this document afterwards)
              expiresAt: Date.now() + 5 * 60 * 1000,
            });
          }

          setUserName(user.displayName || user.email.split("@")[0]);
          setStatus(STATUS.SUCCESS);

          // Sign out from this browser tab — the session lives in the APK
          // (comment this out if you also want the user logged in on web)
          await signOut(auth);
        } else {
          // ── No redirect result yet → start the Google redirect ──────────
          // Read the session ID passed by the APK in the URL
          const params = new URLSearchParams(window.location.search);
          const sessionId = params.get("session");
          if (sessionId) {
            sessionStorage.setItem("apkSessionId", sessionId);
          }

          setStatus(STATUS.SIGNING_IN);
          await signInWithRedirect(auth, googleProvider);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err.message || "Something went wrong.");
        setStatus(STATUS.ERROR);
      }
    };

    run();
  }, []);

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-sm w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Leaf className="w-7 h-7 text-white" />
          </div>
        </div>

        {status === STATUS.CHECKING && (
          <>
            <Loader className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Checking…
            </h2>
            <p className="text-sm text-gray-500">Just a moment</p>
          </>
        )}

        {status === STATUS.SIGNING_IN && (
          <>
            <Loader className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Redirecting to Google…
            </h2>
            <p className="text-sm text-gray-500">
              Sign in with your Google account. You'll be brought back here when
              done.
            </p>
          </>
        )}

        {status === STATUS.SUCCESS && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Signed in!</h2>
            <p className="text-sm text-gray-500 mb-1">
              Welcome,{" "}
              <span className="font-semibold text-green-700">{userName}</span>
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Return to the app — you'll be logged in automatically.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </>
        )}

        {status === STATUS.ERROR && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sign-in Failed
            </h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white font-medium py-2.5 rounded-xl hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
