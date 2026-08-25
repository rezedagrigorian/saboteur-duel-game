import { watch } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useGridStore } from '@/stores/gridStore'
import { connect, disconnect, onMessage, onPeerDisconnected, send, status, SocketStatus } from './socket'
import { ActionEffect, ToolKind } from '@/types/card'
import { ROUND_RESTART_DELAY_MS } from '@/game-core/constants'

let initialized = false
let applyingRemoteAction = false
let gameStarted = false
let restartTimer: ReturnType<typeof setTimeout> | null = null

type Msg =
  | { event: 'hello' }
  | { event: 'gameStart', deckOrder: string[], goalCardIds: string[] }
  | { event: 'placedCard', cardId: string, x: number, y: number, rotation: boolean }
  | { event: 'discardCard', cardId: string }
  | { event: 'playAction', cardId: string, tool: ToolKind, effect: ActionEffect, targetPlayerId: string }

function isMsg(data: unknown): data is Msg {
  return typeof data === 'object' && data !== null && typeof (data as { event?: unknown }).event === 'string'
}

function sendMsg(msg: Msg, to?: string): void {
  send(msg, to)
}

function cancelRestartTimer(): void {
  if (restartTimer === null) return
  clearTimeout(restartTimer)
  restartTimer = null
}

function applyRemote(apply: () => boolean): boolean {
  applyingRemoteAction = true
  try {
    return apply()
  } finally {
    applyingRemoteAction = false
  }
}

export function initSync(playerId: string): void {
  connect(playerId)
  if (initialized) return
  initialized = true

  const gridStore = useGridStore()
  const playerStore = usePlayerStore()
  const cardStore = useCardStore()

  // only the host generates the deck, so both clients share one card order
  function startAndBroadcast(): void {
    const { deckOrder, goalCardIds } = gridStore.hostStartGame()
    sendMsg({ event: 'gameStart', deckOrder, goalCardIds })
  }

  watch(status, value => {
    if (value === SocketStatus.Connected) sendMsg({ event: 'hello' })
  })

  onPeerDisconnected(id => playerStore.removePlayer(id))

  // only the host restarts the round, once per transition into "round over"
  watch(() => cardStore.isRoundOver, isOver => {
    cancelRestartTimer()
    if (!isOver || !playerStore.isHost) return
    restartTimer = setTimeout(() => {
      restartTimer = null
      // the opponent may have left while the timer was running
      if (playerStore.isHost) startAndBroadcast()
    }, ROUND_RESTART_DELAY_MS)
  })

  onMessage(({ from, data }) => {
    if (!isMsg(data)) return

    switch (data.event) {
      case 'hello':
        if(!playerStore.addPlayer(from)) break
        sendMsg({event: 'hello'}, from)
        if(playerStore.isHost && !gameStarted) {
          gameStarted = true
          startAndBroadcast()
        }
        break
      case 'gameStart':
        gridStore.applyStartGame(data.deckOrder, data.goalCardIds)
        break
      case 'placedCard': {
        const cell = gridStore.getCell(data.x, data.y)
        if(!cell) break
        const card = cardStore.getCardById(data.cardId)
        if(card && card.rotation !== data.rotation) {
          cardStore.rotateCardById(data.cardId)
        }
        if (!applyRemote(() => gridStore.assignCardToCell(cell.id, data.cardId, from))) {
          console.warn('[sync] placedCard rejected locally — desync?', data)
        }
        break
      }
      case 'discardCard': {
        if(from !== playerStore.currentPlayerId) break

        if (!applyRemote(() => cardStore.discardCard(from, data.cardId))) {
          console.warn('[sync] discardCard rejected locally — desync?', data)
        }
        break
      }
      case 'playAction': {
        if (from !== playerStore.currentPlayerId) break

        if (!applyRemote(() =>
          cardStore.playActionCard(from, data.cardId, data.tool, data.effect, data.targetPlayerId))) {
          console.warn('[sync] playAction rejected locally — desync?', data)
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
      sendMsg({ event: 'placedCard', x, y, cardId, rotation: card.rotation })
    })
  })
  cardStore.$onAction(({ name, args, after }) => {
    switch (name) {
      case 'discardSelectedCard': {
        const cardId = cardStore.selectedCardId
        after((success) => {
          if (applyingRemoteAction || !success || !cardId) return
          sendMsg({ event: 'discardCard', cardId })
        })
        break
      }
      case 'playActionCard': {
        const [, cardId, tool, effect, targetPlayerId] = args
        after((success) => {
          if (applyingRemoteAction || !success) return
          sendMsg({ event: 'playAction', cardId, tool, effect, targetPlayerId })
        })
        break
      }
    }
  })
}

export function stopSync(): void {
  cancelRestartTimer()
  disconnect()
}
