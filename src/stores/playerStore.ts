import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { IPlayer } from '@/types'
import type { PlayerColor } from '@/types/player'
import { LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'

function createInitialDuelPlayers(): IPlayer[] {
  return [
    { id: 'player1', name: 'Player 1', avatar: '', gold: 0, entranceCardId: LAVANDER_ENTRANCE_CARD_ID },
    { id: 'player2', name: 'Player 2', avatar: '', gold: 0, entranceCardId: YELLOW_ENTRANCE_CARD_ID },
  ]
}

const PLAYER_COLOR_MAP: Record<string, PlayerColor> = {
  player1: 2,
  player2: 1,
}

export const usePlayerStore = defineStore('player', () => {
  const players = ref<IPlayer[]>(createInitialDuelPlayers())
  const currentPlayerId = ref<IPlayer['id']>('player1')

  const currentPlayer = computed(() =>
    players.value.find(player => player.id === currentPlayerId.value)
  )

  const currentPlayerColor = computed<PlayerColor>(
    () => PLAYER_COLOR_MAP[currentPlayerId.value] ?? 1
  )

  function setGold(playerId: string, amount: number) {
    const player = players.value.find(p => p.id === playerId)
    if (player) player.gold = amount
  }


  return { 
    players,
    currentPlayerId,
    currentPlayer,
    currentPlayerColor,
    setGold
  }
})
