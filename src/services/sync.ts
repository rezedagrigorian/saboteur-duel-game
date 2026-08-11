import { watch } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useGridStore } from '@/stores/gridStore'
import { connect, disconnect, onMessage, onPeerDisconnected, send, status, SocketStatus } from './socket'

let initialized = false
let applyingRemoteAction = false
let gameStarted = false

type Msg = 
  | { event: 'hello' }
  | { event: 'gameStart', deckOrder: string[], goalCardIds: string[] }
  | { event: 'placedCard', cardId: string, x: number, y: number, rotation: boolean }
  | { event: 'discardCard', cardId: string }

function isMsg(data: unknown): data is Msg {
  return typeof data === 'object' && data !== null && typeof (data as { event?: unknown }).event === 'string'
}

export function initSync(playerId: string): void {
  connect(playerId)
  if (initialized) return
  initialized = true

  const gridStore = useGridStore()
  const playerStore = usePlayerStore()
  const cardStore = useCardStore()

  watch(status, value => {
    if (value === SocketStatus.Connected) send({ event: 'hello' })
  })

  onPeerDisconnected(id => playerStore.removePlayer(id))

  onMessage(({ from, data }) => {
    if (!isMsg(data)) return

    switch (data.event) {
      case 'hello':
        if(!playerStore.addPlayer(from)) break
        send({event: 'hello'}, from)
        if(playerStore.isHost && !gameStarted) {
          gameStarted = true
          const { deckOrder, goalCardIds } = gridStore.hostStartGame()
          send({ event: 'gameStart', deckOrder, goalCardIds })
        }
        break
      case 'gameStart':
        if(gameStarted) break
        gameStarted = true
        gridStore.applyStartGame(data.deckOrder, data.goalCardIds)
        break
      case 'placedCard': {
        const cell = gridStore.getCell(data.x, data.y)
        if(!cell) break
        const card = cardStore.getCardById(data.cardId)
        if(card && card.rotation !== data.rotation) {
          cardStore.rotateCardById(data.cardId)
        }
        applyingRemoteAction = true
        let ok: boolean
        try {
          ok = gridStore.assignCardToCell(cell.id, data.cardId, from)
        } finally {
          applyingRemoteAction = false
        }
        if (!ok) console.warn('[sync] placedCard rejected locally — desync?', data)
      }
        break
      case 'discardCard': {
        if(from !== playerStore.currentPlayerId) break

        applyingRemoteAction = true
        let ok: boolean
        try {
          ok = cardStore.discardCard(from, data.cardId)
        } finally {
          applyingRemoteAction = false
        }
        if(ok) {
          playerStore.endTurn()
        } else {
          console.warn('[sync] discardCard rejected locally — desync?', data)
        }
        break
      }
    }
  })

  gridStore.$onAction(({ name, args, after }) => {
    if (name !== 'assignCardToCell') return
    after((success) => {
      if (applyingRemoteAction || !success) return
      const [cellId, cardId] = args
      const cell = gridStore.getCellById(cellId)
      if (!cell) return
      const card = cardStore.getCardById(cardId)
      if (!card) return
      const { x, y } = cell.coordinate
      send({ event: 'placedCard', x, y, cardId, rotation: card.rotation })
    })
  })
  cardStore.$onAction(({name, after}) => {
    if(name !== 'discardSelectedCard') return
    const cardId = cardStore.selectedCardId
    after((success) => {
      if (applyingRemoteAction || !success || !cardId) return
      send({ event: 'discardCard', cardId })
    })
  })
}

export function stopSync(): void {
  disconnect()
}
