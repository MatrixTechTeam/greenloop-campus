// src/components/CameraCapture.jsx
import { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, X, Loader2 } from "lucide-react";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // 'user' for front, 'environment' for back
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);

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

    // Stop any existing stream
    stopCamera();

    try {
      const constraints = {
        video: {
          facingMode: { exact: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStreaming(true);
          setLoading(false);
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      // Try without exact facing mode constraint
      try {
        const fallbackConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };
        const stream =
          await navigator.mediaDevices.getUserMedia(fallbackConstraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStreaming(true);
            setLoading(false);
          };
        }
      } catch (fallbackError) {
        setCameraError("Unable to access camera. Please check permissions.");
        setLoading(false);
      }
    }
  };

  const switchCamera = async () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    // Small delay to ensure camera switch works
    setTimeout(() => {
      startCamera();
    }, 100);
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
          onCapture(reader.result); // Pass base64 image data
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.9,
    );

    stopCamera();
  };

  const handleClose = () => {
    stopCamera();
    if (onClose) onClose();
  };

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>
        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          disabled={loading}
        >
          <RefreshCw
            size={24}
            className={`text-white ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <Loader2 size={48} className="text-white animate-spin" />
            <p className="text-white ml-3">Starting camera...</p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6">
            <Camera size={48} className="text-red-400 mb-4" />
            <p className="text-white text-center mb-4">{cameraError}</p>
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
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
          className="w-20 h-20 rounded-full bg-white border-4 border-green-500 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mx-auto" />
        </button>
      </div>
    </div>
  );
}
