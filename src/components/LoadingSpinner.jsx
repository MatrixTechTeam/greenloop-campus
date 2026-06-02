import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 16, md: 28, lg: 40 }
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 size={sizes[size]} className="animate-spin text-primary-600" />
    </div>
  )
}
