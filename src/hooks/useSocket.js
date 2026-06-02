import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const useSocket = (eventHandlers = {}) => {
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] })
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketRef.current.on(event, handler)
    })
    return () => socketRef.current.disconnect()
  }, [])

  const emit = (event, data) => socketRef.current?.emit(event, data)
  return { emit, socket: socketRef.current }
}
