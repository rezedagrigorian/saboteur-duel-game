import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGridStore } from './gridStore'
import { DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH, GOAL_POSITIONS, LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'
import { useCardStore } from './cardStore'
import { usePlayerStore } from './playerStore'
import makeCard from '@/test-utils/makeCard'
import { CardStatus } from '@/types/card'
import type { ICardPorts } from '@/types'

describe('gridStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function expectEntranceCards(gridStore: ReturnType<typeof useGridStore>) {
    expect(gridStore.getCell(2, 2)?.card).toBe(LAVANDER_ENTRANCE_CARD_ID)
    expect(gridStore.getCell(2, 4)?.card).toBe(YELLOW_ENTRANCE_CARD_ID)
  }

  function expectGoldenGoalCards(
    gridStore: ReturnType<typeof useGridStore>,
    cardStore: ReturnType<typeof useCardStore>,
  ) {
    GOAL_POSITIONS.forEach(pos => {
      const cell = gridStore.getCell(pos.x, pos.y)
      expect(cell?.card).toBeDefined()

      const card = cardStore.getCardById(cell!.card!)
      expect(card?.isGolden).toBe(true)
    })
  }

  it('creates a grid with default size', () => {
    const store = useGridStore()
    expect(store.grid.cells).toHaveLength(DEFAULT_GRID_WIDTH * DEFAULT_GRID_HEIGHT)
  })

  it('places entrance cards at expected positions', () => {
    const store = useGridStore()
    expectEntranceCards(store)
  })

  it('places golden goal cards at goal positions', () => {
    const gridStore = useGridStore()
    const cardStore = useCardStore()

    gridStore.hostStartGame()

    expectGoldenGoalCards(gridStore, cardStore)
  })

  it('resets the grid', () => {
    const store = useGridStore()
    store.grid.cells[0].card = 'non-existent-card-id'
    store.initializeGrid()
    expect(store.grid.cells[0].card).toBeUndefined()
  })

  it('places entrance cards after reset and goal cards on game start', () => {
    const gridStore = useGridStore()
    const cardStore = useCardStore()

    gridStore.initializeGrid()
    expectEntranceCards(gridStore)

    gridStore.hostStartGame()
    expectGoldenGoalCards(gridStore, cardStore)
  })

  describe('assignCardToCell', () => {
    const LEFT_PORT: ICardPorts = [{ group: 1 }, undefined, undefined, undefined]
    const TOP_PORT: ICardPorts = [undefined, { group: 1 }, undefined, undefined]

    beforeEach(() => {
      const playerStore = usePlayerStore()
      playerStore.addPlayer('player2')
      playerStore.currentPlayerId = playerStore.localPlayerId
    })

    function setupCardAt(x: number, y: number, ports: ICardPorts, id = 'my-card') {
      const gridStore = useGridStore()
      const cardStore = useCardStore()
      const playerStore = usePlayerStore()

      cardStore.cards.set(id, makeCard({ id, ports }))
      cardStore.selectCard(id)
      const cell = gridStore.getCell(x, y)!
      return { gridStore, cardStore, cell, playerStore }
    }

    it('places the card when all conditions are met', () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(3, 2, LEFT_PORT)

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBe('my-card')
      expect(cardStore.getCardById('my-card')?.status).toBe(CardStatus.Placed)
      expect(cardStore.selectedCardId).toBeNull()
      expect(playerStore.currentPlayerId).toBe(playerStore.opponent?.id)
    })

    it("does not place a card when it is not the player's turn", () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(3, 2, LEFT_PORT)

      gridStore.assignCardToCell(cell.id, 'my-card', 'player2')

      expect(cell.card).toBeUndefined()
      expect(cardStore.getCardById('my-card')?.status).toBe(CardStatus.Deck)
      expect(cardStore.selectedCardId).toBe('my-card')
      expect(playerStore.currentPlayerId).toBe(playerStore.localPlayerId)
    })

    it('does not place a card when ports do not match the neighbor', () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(3, 2, TOP_PORT)

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBeUndefined()
      expect(cardStore.getCardById('my-card')?.status).toBe(CardStatus.Deck)
      expect(playerStore.currentPlayerId).toBe(playerStore.localPlayerId)
    })

    it('does not place a card when there is no path to the entrance', () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(10, 7, LEFT_PORT)

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBeUndefined()
      expect(cardStore.getCardById('my-card')?.status).toBe(CardStatus.Deck)
      expect(playerStore.currentPlayerId).toBe(playerStore.localPlayerId)
    })

    it('does not overwrite an occupied cell', () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(3, 2, LEFT_PORT, 'card-a')
      cardStore.cards.set('card-b', makeCard({ id: 'card-b', ports: LEFT_PORT }))

      gridStore.assignCardToCell(cell.id, 'card-a', playerStore.localPlayerId)
      expect(cell.card).toBe('card-a')

      playerStore.currentPlayerId = playerStore.localPlayerId
      gridStore.assignCardToCell(cell.id, 'card-b', playerStore.localPlayerId)

      expect(cell.card).toBe('card-a')
      expect(cardStore.getCardById('card-b')?.status).toBe(CardStatus.Deck)
      expect(playerStore.currentPlayerId).toBe(playerStore.localPlayerId)
    })

    function placeBridge(
      gridStore: ReturnType<typeof useGridStore>,
      cardStore: ReturnType<typeof useCardStore>,
      rightPort: ICardPorts[number],
    ) {
      cardStore.cards.set('bridge', makeCard({
        id: 'bridge',
        ports: [{ group: 1 }, undefined, rightPort, undefined],
      }))
      gridStore.getCell(3, 2)!.card = 'bridge'
    }

    it('places a card connected to the entrance through another card', () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(4, 2, LEFT_PORT)
      placeBridge(gridStore, cardStore, { group: 1 })

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBe('my-card')
    })

    it('does not place a card when the path leads through a rat port', () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(4, 2, LEFT_PORT)
      placeBridge(gridStore, cardStore, { group: 1, isRat: true })

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBeUndefined()
      expect(cardStore.getCardById('my-card')?.status).toBe(CardStatus.Deck)
      expect(playerStore.currentPlayerId).toBe(playerStore.localPlayerId)
    })

    it("does not place a card when the path leads through another player's door", () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(4, 2, LEFT_PORT)
      placeBridge(gridStore, cardStore, { group: 1, door: 1 })

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBeUndefined()
      expect(cardStore.getCardById('my-card')?.status).toBe(CardStatus.Deck)
      expect(playerStore.currentPlayerId).toBe(playerStore.localPlayerId)
    })

    it('places a card when the path leads through own door', () => {
      const { gridStore, cardStore, cell, playerStore } = setupCardAt(4, 2, LEFT_PORT)
      placeBridge(gridStore, cardStore, { group: 1, door: 2 })

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBe('my-card')
    })

    it('counts gold for the current player after placing a card', () => {
      const gridStore = useGridStore()
      const cardStore = useCardStore()
      const playerStore = usePlayerStore()
      cardStore.cards.set('my-card', makeCard({
        id: 'my-card',
        ports: LEFT_PORT,
        gold: { 1: 3 }, // 3 золота в группе 1
      }))
      const cell = gridStore.getCell(3, 2)!

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBe('my-card')
      expect(playerStore.localPlayer?.gold).toBe(3)
    })

    it('assigns gold only to the player who connects the tunnel, even when the card links both entrances', () => {
      const gridStore = useGridStore()
      const cardStore = useCardStore()
      const playerStore = usePlayerStore()
      cardStore.cards.set('my-card', makeCard({
        id: 'my-card',
        ports: [undefined, { group: 1 }, undefined, { group: 1 }],
        gold: { 1: 3 },
      }))
      const cell = gridStore.getCell(2, 3)!

      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBe('my-card')
      expect(playerStore.localPlayer?.gold).toBe(3)
      expect(playerStore.opponent?.gold).toBe(0)
      expect(cardStore.getCardById('my-card')?.goldOwners?.[1]).toBe(playerStore.localPlayerId)
    })

    it('counts gold behind a door only for the player of that color', () => {
      const gridStore = useGridStore()
      const cardStore = useCardStore()
      const playerStore = usePlayerStore()
      cardStore.cards.set('door-card', makeCard({
        id: 'door-card',
        ports: [undefined, { group: 1, door: 1 }, undefined, { group: 1 }],
        gold: { 1: 5 },
      }))
      gridStore.getCell(2, 3)!.card = 'door-card'
      cardStore.cards.set('my-card', makeCard({ id: 'my-card', ports: LEFT_PORT }))

      const cell = gridStore.getCell(3, 2)!
      gridStore.assignCardToCell(cell.id, 'my-card', playerStore.localPlayerId)

      expect(cell.card).toBe('my-card')
      expect(playerStore.localPlayer?.gold).toBe(0)
      expect(playerStore.opponent?.gold).toBe(5)
    })
  })
})
