// src/pages/AuthCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  getRedirectResult,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Leaf, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log("Processing redirect result...");
        const result = await getRedirectResult(auth);

        if (result?.user) {
          console.log("User authenticated:", result.user.uid);

          // Get the session ID from URL if present
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get("session");

          if (sessionId) {
            console.log("Session ID found:", sessionId);

            // Write the session data to Firestore for the WebView to pick up
            const sessionRef = doc(db, "apk_auth_sessions", sessionId);
            await setDoc(sessionRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              timestamp: serverTimestamp(),
              expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
            });
            console.log("Session document written to Firestore");
          }

          setStatus("success");

          // Try to close the tab/window if possible
          setTimeout(() => {
            // For WebView: send a message back
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: "AUTH_SUCCESS",
                  user: {
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                  },
                }),
              );
            }

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 2000);
          }, 1000);
        } else {
          console.log("No redirect result found");
          setStatus("error");
          setErrorMessage("No user data found. Please try signing in again.");
        }
      } catch (error) {
        console.error("Redirect result error:", error);
        setStatus("error");
        setErrorMessage(
          error.message || "Authentication failed. Please try again.",
        );
      }
    };

    handleRedirectResult();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Completing Sign In...
            </h2>
            <p className="text-gray-500">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Successfully Signed In!
            </h2>
            <p className="text-gray-500">Redirecting you to the dashboard...</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-600 h-1.5 rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sign In Failed
            </h2>
            <p className="text-gray-500 mb-4">{errorMessage}</p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Login
            </button>
          </>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <Leaf size={16} className="text-green-500" />
          <span className="text-xs text-gray-400">GreenLoop Campus</span>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
