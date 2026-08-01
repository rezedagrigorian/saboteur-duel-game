import { ref } from 'vue'

export const SocketStatus = {
  Disconnected: 'disconnected',
  Connecting: 'connecting',
  Connected: 'connected',
} as const

export type SocketStatus = (typeof SocketStatus)[keyof typeof SocketStatus]

export interface IIncomingMessage {
  from: string
  data: unknown
}

type MessageHandler = (message: IIncomingMessage) => void
type PeerDisconnectHandler = (id: string) => void

const WS_URL: string = import.meta.env.VITE_WS_URL ?? 'ws://localhost:7777'

export const status = ref<SocketStatus>(SocketStatus.Disconnected)

let socket: WebSocket | null = null
let messageHandler: MessageHandler | null = null
let peerDisconnectHandler: PeerDisconnectHandler | null = null

export function onMessage(handler: MessageHandler): void {
  messageHandler = handler
}

export function onPeerDisconnected(handler: PeerDisconnectHandler): void {
  peerDisconnectHandler = handler
}

export function connect(id: string): void {
  if (socket) return

  status.value = SocketStatus.Connecting
  socket = new WebSocket(WS_URL)

  socket.addEventListener('open', () => {
    socket?.send(JSON.stringify({ type: 'register', id }))
  })

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.type === 'registered') {
      status.value = SocketStatus.Connected
    } else if (message.type === 'message') {
      messageHandler?.({ from: message.from, data: message.data })
    } else if (message.type === 'disconnected') {
      peerDisconnectHandler?.(message.id)
    } else if (message.type === 'error') {
      console.warn('[socket] server error:', message)
    }
  })

  socket.addEventListener('close', () => {
    socket = null
    status.value = SocketStatus.Disconnected
  })
}

export function disconnect(): void {
  socket?.close()
}

export function send(data: unknown, to?: string): void {
  if (!socket || status.value !== SocketStatus.Connected) return
  const payload = to === undefined ? { data } : { to, data }
  socket.send(JSON.stringify(payload))
}
