// src/utils/helpers.js
import { BADGE_LEVELS } from './constants'

export const getBadge = (points = 0) =>
  [...BADGE_LEVELS].reverse().find(b => points >= b.minPoints) || BADGE_LEVELS[0]

export const formatDate = (ts) => {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatRelative = (ts) => {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload  = () => res(reader.result.split(',')[1])
    reader.onerror = rej
  })

export const computeImageHash = async (base64) => {
  const data = new TextEncoder().encode(base64.slice(0, 1000))
  const buf  = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const truncate = (str = '', max = 60) =>
  str.length > max ? str.slice(0, max) + '…' : str

export const initials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

export const statusColor = (status) => ({
  Recyclable:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Upcycled:        'text-purple-400  bg-purple-500/10  border-purple-500/20',
  Reusable:        'text-blue-400    bg-blue-500/10    border-blue-500/20',
  Exchangeable:    'text-amber-400   bg-amber-500/10   border-amber-500/20',
  'Not Recyclable':'text-slate-400   bg-slate-500/10   border-slate-500/20',
}[status] || 'text-slate-400 bg-slate-500/10 border-slate-500/20')

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2)