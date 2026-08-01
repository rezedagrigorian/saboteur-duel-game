import { watch } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { usePlayerStore } from '@/stores/playerStore'
import { connect, disconnect, onMessage, onPeerDisconnected, send, status, SocketStatus } from './socket'

let initialized = false

function isHello(data: unknown): boolean {
  return typeof data === 'object' && data !== null && (data as { event?: unknown }).event === 'hello'
}

export function initSync(playerId: string): void {
  connect(playerId)

  if (initialized) return
  initialized = true

  const playerStore = usePlayerStore()
  const cardStore = useCardStore()

  watch(status, value => {
    if (value === SocketStatus.Connected) send({ event: 'hello' })
  })

  onPeerDisconnected(id => playerStore.removePlayer(id))

  onMessage(({ from, data }) => {
    // eslint-disable-next-line no-console
    console.log(`[sync] from ${from}:`, data)

    if (isHello(data) && playerStore.addPlayer(from)) {
      send({ event: 'hello' }, from)
    }
  })

  cardStore.$onAction(({ name, args, after }) => {
    if (name !== 'selectCard') return
    after(() => {
      const [cardId] = args
      send({ event: 'cardSelected', cardId })
    })
  })
}

export function stopSync(): void {
  disconnect()
}
