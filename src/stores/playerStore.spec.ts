import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from './playerStore'

describe('playerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with only the local player, having 0 gold', () => {
    const store = usePlayerStore()
    expect(store.players).toHaveLength(1)
    store.players.forEach(player => {
      expect(player.gold).toBe(0)
    })
  })

  it('currentPlayer initializes with the first player', () => {
    const store = usePlayerStore()
    expect(store.currentPlayer?.id).toBe(store.localPlayerId)
  })

  it('currentPlayer changes when currentPlayerId changes', () => {
    const store = usePlayerStore()
    store.addPlayer('player2')
    store.currentPlayerId = 'player2'
    expect(store.currentPlayer?.id).toBe('player2')
  })

  it('returns undefined when currentPlayer does not match any player', () => {
    const store = usePlayerStore()
    store.currentPlayerId = 'player3'
    expect(store.currentPlayer).toBeUndefined()
  })

  it('returns player color based on currentPlayerId', () => {
    const store = usePlayerStore()
    store.addPlayer('player2')

    expect(store.currentPlayerColor).toBe(2)
    store.currentPlayerId = 'player2'
    expect(store.currentPlayerColor).toBe(1)
  })

  it('fallback to color 1 for unknown currentPlayerId', () => {
    const store = usePlayerStore()
    store.currentPlayerId = 'player3'
    expect(store.currentPlayerColor).toBe(1)
  })

  it('can set gold for a player', () => {
    const store = usePlayerStore()
    store.setGold(store.localPlayerId, 7)
    expect(store.localPlayer?.gold).toBe(7)
  })

  it('does nothing when player id does not exist', () => {
    const store = usePlayerStore()
    store.setGold('player99', 7)
    store.players.forEach(player => 
      expect(player.gold).toBe(0))
  })

  it('endTurn passes the turn to the next player and back', () => {
    const store = usePlayerStore()
    store.addPlayer('player2')

    store.endTurn()
    expect(store.currentPlayer?.id).toBe('player2')
    expect(store.currentPlayerColor).toBe(1)
    store.endTurn()
    expect(store.currentPlayer?.id).toBe(store.localPlayerId)
    expect(store.currentPlayerColor).toBe(2)
  })

  it('opponent stays fixed when the turn changes', () => {
    const store = usePlayerStore()
    const localId = store.localPlayerId
    store.addPlayer('player2')

    expect(store.opponent?.id).toBe('player2')

    store.endTurn()
    expect(store.localPlayerId).toBe(localId)
    expect(store.opponent?.id).toBe('player2')
    expect(store.currentPlayer?.id).toBe('player2')
  })
})
