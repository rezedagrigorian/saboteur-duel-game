import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { IPlayer } from '@/types'
import { LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'
import { ActionEffect, type ICardAction } from '@/types/card'

function createInitialDuelPlayers(): IPlayer[] {
  return [
    { id: 'player1', name: 'Player 1', avatar: '/cards/characters/icons/lavander-mole-icon.svg', gold: 0, entranceCardId: LAVANDER_ENTRANCE_CARD_ID, color: 2, brokenTools: [] },
    { id: 'player2', name: 'Player 2', avatar: '/cards/characters/icons/yellow-mole-icon.svg', gold: 0, entranceCardId: YELLOW_ENTRANCE_CARD_ID, color: 1, brokenTools: [] },
  ]
}

export const usePlayerStore = defineStore('player', () => {
  const players = ref<IPlayer[]>(createInitialDuelPlayers())
  const localPlayerId = ref<IPlayer['id']>('player1')
  const currentPlayerId = ref<IPlayer['id']>('player1')

  const getPlayerById = (playerId: string) => players.value.find(player => player.id === playerId)

  const localPlayer = computed(() => getPlayerById(localPlayerId.value))

  const opponent = computed(() => getPlayerById(localPlayerId.value === 'player1' ? 'player2' : 'player1'))

  const currentPlayer = computed(() => getPlayerById(currentPlayerId.value))

  // todo: remove this
  const currentPlayerColor = computed(() =>
    currentPlayer.value?.color ?? 1
  )

  function setGold(playerId: string, amount: number) {
    const player = getPlayerById(playerId)
    if (player) player.gold = amount
  }

  function applyAction(targetPlayerId: string, action: ICardAction): boolean {
    const targetPlayer = getPlayerById(targetPlayerId)
    if (!targetPlayer) return false

    const isBroken = targetPlayer.brokenTools.includes(action.tool)

    switch (action.effect) {
      case ActionEffect.Break:
        if (isBroken) return false
        targetPlayer.brokenTools.push(action.tool)
        break
      case ActionEffect.Fix:
        if (!isBroken) return false
        targetPlayer.brokenTools = targetPlayer.brokenTools.filter(t => t !== action.tool)
        break
    }
    return true
  }

  function endTurn() {
    // todo string literals instead of hardcoded values
    const nextPlayer = getPlayerById(currentPlayerId.value === 'player1' ? 'player2' : 'player1')
    if (!nextPlayer) return
    currentPlayerId.value = nextPlayer.id
  }

  return {
    players,
    localPlayerId,
    currentPlayerId,
    localPlayer,
    opponent,
    currentPlayer,
    currentPlayerColor,
    setGold,
    applyAction,
    endTurn,
  }
})
