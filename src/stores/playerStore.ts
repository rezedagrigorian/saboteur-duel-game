import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { IPlayer } from '@/types'
import { LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID, MAX_PLAYERS, ROUND_COUNT } from '@/game-core/constants'
import { ActionEffect, type ICardAction } from '@/types/card'

type RolePreset = Pick<IPlayer, 'name' | 'avatar' | 'entranceCardId' | 'color'>

const LAVANDER_PRESET: RolePreset = {
  name: 'Lavander',
  avatar: '/cards/characters/icons/lavander-mole-icon.svg',
  entranceCardId: LAVANDER_ENTRANCE_CARD_ID,
  color: 2,
}

const YELLOW_PRESET: RolePreset = {
  name: 'Yellow',
  avatar: '/cards/characters/icons/yellow-mole-icon.svg',
  entranceCardId: YELLOW_ENTRANCE_CARD_ID,
  color: 1,
}

function generatePlayerId(): string {
  return `player-${crypto.randomUUID().slice(0, 8)}`
}

function createPlayer(id: string): IPlayer {
  return { id, gold: 0, brokenTools: [], totalGold: 0, ...LAVANDER_PRESET }
}

export const usePlayerStore = defineStore('player', () => {
  const players = ref<IPlayer[]>([createPlayer(generatePlayerId())])
  const localPlayerId = ref<IPlayer['id']>(players.value[0].id)
  const currentPlayerId = ref<IPlayer['id']>(localPlayerId.value)
  // 0 until the first round starts; always the round currently in progress
  const roundNumber = ref(0)
  const gameOver = ref(false)

  const getPlayerById = (playerId: string) => players.value.find(player => player.id === playerId)

  function getSortedPlayers(): IPlayer[] {
    return [...players.value].sort((a, b) => a.id.localeCompare(b.id))
  }

  function assignRoles(): void {
    if (players.value.length < MAX_PLAYERS) return
    const [lavander, yellow] = getSortedPlayers()
    Object.assign(lavander, LAVANDER_PRESET)
    Object.assign(yellow, YELLOW_PRESET)
    currentPlayerId.value = lavander.id
  }

  function addPlayer(id: string): boolean {
    if (players.value.length >= MAX_PLAYERS || getPlayerById(id)) return false
    players.value.push(createPlayer(id))
    assignRoles()
    return true
  }

  const localPlayer = computed(() => getPlayerById(localPlayerId.value))

  const sortedPlayerIds = computed(() => getSortedPlayers().map(p => p.id))

  const isHost = computed(() =>
    players.value.length === MAX_PLAYERS &&
    localPlayer.value?.entranceCardId === LAVANDER_ENTRANCE_CARD_ID
  )

  const opponent = computed(() => players.value.find(player => player.id !== localPlayerId.value))

  const currentPlayer = computed(() => getPlayerById(currentPlayerId.value))

  // todo: remove this
  const currentPlayerColor = computed(() =>
    currentPlayer.value?.color ?? 1
  )

  function leaderBy(field: 'gold' | 'totalGold') {
    return computed(() => {
      if (players.value.length < MAX_PLAYERS) return null

      const [player1, player2] = players.value
      if (player1[field] === player2[field]) return null

      return player1[field] > player2[field] ? player1 : player2
    })
  }

  const winner = leaderBy('totalGold')
  const roundWinner = leaderBy('gold')

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

  function removePlayer(id: string): void {
    if (id === localPlayerId.value || !getPlayerById(id)) return
    players.value = players.value.filter(player => player.id !== id)
    if (currentPlayerId.value === id) currentPlayerId.value = localPlayerId.value
  }

  function endTurn() {
    const nextPlayer = players.value.find(player => player.id !== currentPlayerId.value)
    if (!nextPlayer) return
    currentPlayerId.value = nextPlayer.id
  }

  function finishRound() {
    players.value.forEach(player => {
      player.totalGold += player.gold
    })
    if (roundNumber.value === ROUND_COUNT) gameOver.value = true
  }

  function resetRoundState() {
    roundNumber.value++
    players.value.forEach(player => {
      player.gold = 0
      player.brokenTools = []
    })
    assignRoles()
  }

  function resetGame() {
    roundNumber.value = 0
    gameOver.value = false
    players.value.forEach(player => {
      player.totalGold = 0
      player.brokenTools = []
    })
    assignRoles()
  }

  return {
    players,
    localPlayerId,
    currentPlayerId,
    getPlayerById,
    localPlayer,
    opponent,
    currentPlayer,
    currentPlayerColor,
    setGold,
    applyAction,
    addPlayer,
    removePlayer,
    endTurn,
    isHost,
    sortedPlayerIds,
    winner,
    roundWinner,
    resetGame,
    finishRound,
    roundNumber,
    gameOver,
    resetRoundState
  }
})
