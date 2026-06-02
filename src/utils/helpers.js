export const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const truncate = (str, length = 60) =>
  str.length > length ? str.slice(0, length) + '...' : str

export const classNames = (...classes) => classes.filter(Boolean).join(' ')
