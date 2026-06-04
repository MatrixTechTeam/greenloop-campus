// src/components/CameraCapture.jsx
import { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, X, Loader2, AlertTriangle } from "lucide-react";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const startCamera = async () => {
    setLoading(true);
    setCameraError(null);
    setPermissionDenied(false);

    stopCamera();

    // Define progressive constraints from most specific to most compatible
    const constraintsList = [
      // Try 1: Exact facing mode with HD
      {
        video: {
          facingMode: { exact: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      // Try 2: Facing mode preferred (not exact)
      {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      // Try 3: Facing mode with lower resolution
      {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      },
      // Try 4: Just facing mode without resolution constraints
      {
        video: {
          facingMode: facingMode,
        },
      },
      // Try 5: Any camera (no facing mode)
      {
        video: true,
      },
      // Try 6: Minimal constraints
      {
        video: {
          width: { min: 320, ideal: 640 },
          height: { min: 240, ideal: 480 },
        },
      },
    ];

    for (let i = 0; i < constraintsList.length; i++) {
      try {
        const constraints = constraintsList[i];
        console.log(`Trying camera constraint ${i + 1}:`, constraints);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStreaming(true);
            setLoading(false);
            console.log("Camera started successfully with constraint", i + 1);
          };
        }
        return; // Success - exit the function
      } catch (error) {
        console.log(`Constraint ${i + 1} failed:`, error.name);
        // Continue to next constraint
      }
    }

    // All attempts failed - check if it's a permission issue
    try {
      // Last resort: check if we can get any camera at all
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      testStream.getTracks().forEach((track) => track.stop());
      setCameraError(
        "Camera found but unable to configure. Try restarting the app.",
      );
    } catch (err) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setPermissionDenied(true);
        setCameraError(
          "Camera permission denied. Please enable in app settings.",
        );
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Unable to access camera. Please check permissions.");
      }
    }

    setLoading(false);
  };

  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    // Small delay before restarting camera
    setTimeout(() => {
      startCamera();
    }, 300);
  };

  const capture = () => {
    if (!videoRef.current || !streaming) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          onCapture(reader.result);
          stopCamera();
          onClose();
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleClose = () => {
    stopCamera();
    if (onClose) onClose();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

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
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6">
            <AlertTriangle size={48} className="text-yellow-400 mb-4" />
            <p className="text-white text-center mb-4">{cameraError}</p>
            {permissionDenied && (
              <div className="text-center mb-4 p-3 bg-yellow-500/20 rounded-lg max-w-xs">
                <p className="text-yellow-300 text-sm mb-2">
                  📱 To enable camera:
                </p>
                <p className="text-white text-xs">
                  1. Close this app
                  <br />
                  2. Go to Phone Settings → Apps → GreenLoop
                  <br />
                  3. Tap Permissions → Enable Camera
                  <br />
                  4. Restart the app
                </p>
              </div>
            )}
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-green-600 text-white rounded-lg active:bg-green-700"
            >
              Try Again
            </button>
            {permissionDenied && (
              <button
                onClick={handleClose}
                className="mt-3 px-6 py-2 bg-gray-600 text-white rounded-lg active:bg-gray-700"
              >
                Close
              </button>
            )}
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />
      </div>

      {/* Capture Button */}
      <div className="p-8 flex justify-center bg-black/50 backdrop-blur-sm">
        <button
          onClick={capture}
          disabled={!streaming || loading}
          className="w-20 h-20 rounded-full bg-white border-4 border-green-500 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mx-auto" />
        </button>
      </div>
    </div>
  );
}
