export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass rounded-2xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
