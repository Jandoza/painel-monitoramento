import { io, Socket } from 'socket.io-client'
import { API_URL } from './api'

let socket: Socket | null = null
export function getSocket() {
  if (!socket) socket = API_URL ? io(API_URL, { transports: ['websocket'] }) : io({ transports: ['websocket'] })
  return socket
}
