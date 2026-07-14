import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { IPlayer } from '@/types'
import { LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'

function createInitialDuelPlayers(): IPlayer[] {
  return [
    { id: 'player1', name: 'Player 1', avatar: '', gold: 0, entranceCardId: LAVANDER_ENTRANCE_CARD_ID, color: 2 },
    { id: 'player2', name: 'Player 2', avatar: '', gold: 0, entranceCardId: YELLOW_ENTRANCE_CARD_ID, color: 1 },
  ]
}

export const usePlayerStore = defineStore('player', () => {
  const players = ref<IPlayer[]>(createInitialDuelPlayers())
  const currentPlayerId = ref<IPlayer['id']>('player1')

  const currentPlayer = computed(() =>
    players.value.find(player => player.id === currentPlayerId.value)
  )

  const currentPlayerColor = computed(() => 
    currentPlayer.value?.color ?? 1
  )

  function setGold(playerId: string, amount: number) {
    const player = players.value.find(p => p.id === playerId)
    if (player) player.gold = amount
  }

  function endTurn() {
    const nextPlayer = players.value.find(player => player.id !== currentPlayer.value?.id)
    if (!nextPlayer) return
    currentPlayerId.value = nextPlayer.id
  }

  return { 
    players,
    currentPlayerId,
    currentPlayer,
    currentPlayerColor,
    setGold,
    endTurn
  }
})
