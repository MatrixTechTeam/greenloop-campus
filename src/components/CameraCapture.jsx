// src/components/CameraCapture.jsx
import { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, X, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  // Check if we're in a WebView/AppCreator24 environment
  const isWebView = () => {
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes("webview") ||
      ua.includes("wv") ||
      ua.includes("appcreator24") ||
      window.location.href.includes("file://") ||
      ua.includes("android") // Android WebView often identifies as Android
    );
  };

  // Try multiple camera constraints progressively
  const tryCameraConstraints = async (attempt = 0) => {
    const constraintsList = [
      // Attempt 0: Simple video only (most compatible)
      { video: true },
      // Attempt 1: With facing mode preferred
      { video: { facingMode: facingMode } },
      // Attempt 2: With exact facing mode
      { video: { facingMode: { exact: facingMode } } },
      // Attempt 3: Low resolution
      { video: { width: { ideal: 640 }, height: { ideal: 480 } } },
      // Attempt 4: Front camera only
      { video: { facingMode: "user" } },
      // Attempt 5: Back camera only
      { video: { facingMode: "environment" } },
    ];

    for (let i = attempt; i < constraintsList.length; i++) {
      try {
        console.log(`Trying camera constraint ${i + 1}:`, constraintsList[i]);
        const stream = await navigator.mediaDevices.getUserMedia(
          constraintsList[i],
        );

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          return new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current
                .play()
                .then(() => {
                  console.log(
                    "Camera started successfully with constraint",
                    i + 1,
                  );
                  setStreaming(true);
                  setLoading(false);
                  resolve(true);
                })
                .catch((err) => {
                  console.error("Video play error:", err);
                  resolve(false);
                });
            };
          });
        }
        return true;
      } catch (error) {
        console.log(`Constraint ${i + 1} failed:`, error.name);
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setPermissionDenied(true);
          setCameraError(
            "Camera permission denied. Please enable in app settings.",
          );
          setLoading(false);
          return false;
        }
        // Continue to next constraint
      }
    }
    return false;
  };

  const startCamera = async () => {
    setLoading(true);
    setCameraError(null);
    setPermissionDenied(false);
    stopCamera();

    // Small delay to ensure clean state
    await new Promise((resolve) => setTimeout(resolve, 100));

    const success = await tryCameraConstraints(retryCount);

    if (!success && !permissionDenied) {
      setCameraError(
        "Unable to access camera. Please check permissions and try again.",
      );
      setLoading(false);
    }
  };

  const switchCamera = () => {
    if (isWebView()) {
      toast.error("Camera switching may not work in this app");
      // Still try to switch
    }
    stopCamera();
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    setRetryCount(0);
    setTimeout(() => startCamera(), 200);
  };

  const capture = () => {
    if (!videoRef.current || !streaming) {
      toast.error("Camera not ready. Please wait.");
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      toast.error("Camera not ready. Please try again.");
      return;
    }

    const context = canvas.getContext("2d");
    // Apply mirror effect for front camera
    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to JPEG blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            onCapture(reader.result);
            stopCamera();
            onClose();
            toast.success("Photo captured successfully!");
          };
          reader.readAsDataURL(blob);
        } else {
          toast.error("Failed to capture photo");
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleClose = () => {
    stopCamera();
    if (onClose) onClose();
  };

  const retryWithDifferentSettings = () => {
    setRetryCount((prev) => prev + 1);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // If no camera is available, show a message
  if (!hasCamera && cameraError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
        <AlertTriangle size={64} className="text-yellow-400 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">No Camera Found</h2>
        <p className="text-gray-300 text-center mb-6">{cameraError}</p>
        <button
          onClick={handleClose}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/20 active:bg-white/30 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>
        <button
          onClick={switchCamera}
          disabled={loading}
          className="p-2 rounded-full bg-white/20 active:bg-white/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={24}
            className={`text-white ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative bg-black">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
            <Loader2 size={48} className="text-white animate-spin" />
            <p className="text-white mt-3 text-sm">Starting camera...</p>
            <p className="text-white/50 text-xs mt-2">
              Please allow camera permission
            </p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6">
            <AlertTriangle size={48} className="text-yellow-400 mb-4" />
            <p className="text-white text-center mb-4">{cameraError}</p>
            {permissionDenied && (
              <div className="text-center mb-4 p-3 bg-yellow-500/20 rounded-lg max-w-xs">
                <p className="text-yellow-300 text-sm mb-2 font-semibold">
                  📱 How to enable camera:
                </p>
                <p className="text-white text-xs">
                  1. Close this app completely
                  <br />
                  2. Go to Phone Settings → Apps → GreenLoop
                  <br />
                  3. Tap Permissions → Camera
                  <br />
                  4. Select "Allow"
                  <br />
                  5. Restart the app
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={retryWithDifferentSettings}
                className="px-6 py-2 bg-green-600 text-white rounded-lg active:bg-green-700"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg active:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />
      </div>

      {/* Capture Button */}
      <div className="p-8 flex justify-center bg-black/50 backdrop-blur-sm">
        <button
          onClick={capture}
          disabled={!streaming || loading}
          className="w-20 h-20 rounded-full bg-white border-4 border-green-500 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg hover:bg-gray-100"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mx-auto" />
        </button>
      </div>

      {/* Instructions for users */}
      {!streaming && !loading && !cameraError && (
        <div className="absolute bottom-32 left-0 right-0 text-center">
          <p className="text-white/70 text-xs bg-black/50 py-2 px-4 rounded-full inline-block mx-auto">
            Tap "Allow" when prompted for camera access
          </p>
        </div>
      )}
    </div>
  );
}
