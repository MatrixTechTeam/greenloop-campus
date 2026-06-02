import { useRef, useState } from 'react'

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null)
  const [streaming, setStreaming] = useState(false)

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
    videoRef.current.play()
    setStreaming(true)
  }

  const capture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1]
    onCapture(base64)
    videoRef.current.srcObject.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <video ref={videoRef} className="w-full rounded-xl bg-black" />
      {!streaming
        ? <button onClick={startCamera} className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors">Open Camera</button>
        : <button onClick={capture} className="w-full bg-eco-leaf text-white py-2.5 rounded-xl font-medium hover:bg-primary-800 transition-colors">Capture</button>
      }
    </div>
  )
}
