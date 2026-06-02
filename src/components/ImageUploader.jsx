import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'

export default function ImageUploader({ onImageSelected }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
      onImageSelected(file, reader.result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={() => inputRef.current.click()}
        className="w-full h-48 border-2 border-dashed border-primary-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary-50 transition-colors overflow-hidden"
      >
        {preview
          ? <img src={preview} alt="Preview" className="object-cover w-full h-full rounded-xl" />
          : (
            <div className="text-center text-gray-400 flex flex-col items-center gap-2">
              <Camera size={32} className="text-primary-300" />
              <p className="text-sm">Click to upload image</p>
            </div>
          )
        }
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  )
}
