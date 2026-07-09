import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCardStore } from './cardStore'
import { LAVANDER_ENTRANCE_CARD_ID, YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'
import { CardStatus } from '@/types/card'
import type { ICard, ICardPorts } from '@/types'

function makeCard(overrides: Partial<ICard> = {}): ICard {
  return {
    id: 'test-card',
    ports: [
      { group: 1 },
      { group: 2 },
      { group: 3 },
      { group: 4 },
    ],
    action: null,
    isGolden: false,
    style: {},
    status: CardStatus.Deck,
    owner: null,
    rotation: false,
    isRevealed: false,
    ...overrides,
  }
}

describe('cardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('selectCard / clearSelection', () => {
    it('selectedCardId is null initially', () => {
      const store = useCardStore()
      expect(store.selectedCardId).toBeNull()
    })

    it('selectCard sets selectedCardId to the given id', () => {
      const store = useCardStore()
      store.selectCard('12345')
      expect(store.selectedCardId).toBe('12345')
    })

    it('clearSelection resets selectedCardId to null', () => {
      const store = useCardStore()
      store.selectCard('12345')
      store.clearSelection()
      expect(store.selectedCardId).toBeNull()
    })
  })

  describe('getCardById', () => {
    it('returns the card when id exists', () => {
      const store = useCardStore()
      const someId = store.cardIds[0]
      const card = store.getCardById(someId)
      expect(card).toBeDefined()
      expect(card?.id).toBe(someId)
    })

    it('returns undefined when id does not exist', () => {
      const store = useCardStore()
      expect(store.getCardById('this-id-does-not-exist')).toBeUndefined()
    })
  })

  describe('cardIds / playableCardIds', () => {
    it('cardIds returns all card ids', () => {
      const store = useCardStore()
      expect(store.cardIds).toHaveLength(store.cards.size)
      store.cardIds.forEach(id => {
        expect(store.cards.has(id)).toBe(true)
      })
    })

    it('playableCardIds excludes entrance cards', () => {
      const store = useCardStore()
      expect(store.playableCardIds).toHaveLength(store.cards.size - 2)
      expect(store.playableCardIds).not.toContain(LAVANDER_ENTRANCE_CARD_ID)
      expect(store.playableCardIds).not.toContain(YELLOW_ENTRANCE_CARD_ID)
    })
  })

  describe('markCardAsPlaced', () => {
    it('marks the card as placed when called with valid id and playerId', () => {
      const store = useCardStore()
      const someId = store.playableCardIds[0]
      const card = store.getCardById(someId)

      expect(card?.status).toBe(CardStatus.Deck)
      store.markCardAsPlaced(someId, 'player1')
      expect(card?.status).toBe(CardStatus.Placed)
    })

    it('does nothing when playerId is empty or whitespace', () => {
      const store = useCardStore()
      const someId = store.playableCardIds[0]
      const card = store.getCardById(someId)
      const statusBefore = card?.status

      store.markCardAsPlaced(someId, '')
      store.markCardAsPlaced(someId, '   ')
      expect(card?.status).toBe(statusBefore)
    })

    it('does nothing when card id does not exist', () => {
      const store = useCardStore()
      const statusesBefore = store.cardIds.map(id => store.getCardById(id)?.status)
      store.markCardAsPlaced('id-does-not-exist', 'player1')
      const statusesAfter = store.cardIds.map(id => store.getCardById(id)?.status)
      expect(statusesAfter).toEqual(statusesBefore)
    })
  })

  describe('rotateSelectedCard', () => {
    it('toggles rotation flag', () => {
      const store = useCardStore()
      const someId = store.playableCardIds[0]

      const cardBefore = store.getCardById(someId)
      expect(cardBefore?.rotation).toBe(false)

      store.selectCard(someId)
      store.rotateSelectedCard()

      const cardAfterFirst = store.getCardById(someId)
      expect(cardAfterFirst?.rotation).toBe(true)

      store.rotateSelectedCard()

      const cardAfterSecond = store.getCardById(someId)
      expect(cardAfterSecond?.rotation).toBe(false)
    })

    it('rotetes ports 180 degrees', () => {
      const store = useCardStore()
      store.cards.set('test-card', makeCard({ id: 'test-card' }))
      store.selectCard('test-card')

      store.rotateSelectedCard()

      const rotated = store.cards.get('test-card')
      expect(rotated?.ports).toEqual([
        { group: 3 },
        { group: 4 },
        { group: 1 },
        { group: 2 },
      ])
    })

    it('does nothing when no card is selected', () => {
      const store = useCardStore()
      store.cards.set('test-1', makeCard({ id: 'test-1' }))

      const snapshotBefore = { ...store.cards.get('test-1')! }
      store.rotateSelectedCard()

      expect(store.cards.get('test-1')).toEqual(snapshotBefore)
    })

    it('does nothing when selected card id does not exist', () => {
      const store = useCardStore()
      store.cards.set('test-1', makeCard({ id: 'test-1' }))
      store.selectCard('nonexistent-id')

      const snapshotBefore = { ...store.cards.get('test-1')! }

      store.rotateSelectedCard()

      expect(store.cards.get('test-1')).toEqual(snapshotBefore)
    })
  })

  describe('getPortsByCardID', () => {
    it('returns the ports of the card when id exists', () => {
      const store = useCardStore()
      const expectedPorts: ICardPorts = [
        { group: 1 }, { group: 2 }, { group: 3 }, { group: 4 }
      ]
      store.cards.set('test-card', makeCard({ id: 'test-card', ports: expectedPorts }))

      expect(store.getPortsByCardID('test-card')).toEqual(expectedPorts)
    })

    it('returns an empty array when card id does not exist', () => {
      const store = useCardStore()
      const ports = store.getPortsByCardID('nonexistent-id')
      expect(ports).toHaveLength(0)
    })
  })

  describe('getRandomCard', () => {
    it('assign a deck card to the player', () => {
      const store = useCardStore()
      vi.spyOn(Math, 'random').mockReturnValue(0)

      const firstDeckCard = Array.from(store.cards.values()).find(card => card.status === CardStatus.Deck)!
      const expectedId = firstDeckCard.id

      store.getRandomCard('player1')

      const picked = store.getCardById(expectedId)
      expect(picked?.status).toBe(CardStatus.Hand)
      expect(picked?.owner).toBe('player1')
    })

    it('does nothing when deck is empty', () => {
      const store = useCardStore()
      store.cards.clear()
      store.cards.set('test-1', makeCard({ id: 'test-1', status: CardStatus.Hand, owner: 'someone' }))

      store.getRandomCard('player1')

      const card = store.getCardById('test-1')
      expect(card?.status).toBe(CardStatus.Hand)
      expect(card?.owner).toBe('someone')
    })
  })

  describe('pickGoalCards', () => {
    function setupGoldenCards() {
      const store = useCardStore()
      store.cards.clear()
      store.cards.set('g1', makeCard({ id: 'g1', isGolden: true }))
      store.cards.set('g2', makeCard({ id: 'g2', isGolden: true }))
      store.cards.set('g3', makeCard({ id: 'g3', isGolden: true }))
      store.cards.set('n1', makeCard({ id: 'n1' }))
      return store
    }

    it('picks the correct number of goal cards', () => {
      const store = setupGoldenCards()

      const goalCards = store.pickGoalCards(3)
      expect(goalCards).toHaveLength(3)
      expect([...goalCards].sort()).toEqual(['g1', 'g2', 'g3'])
      expect(store.getCardById('g1')?.status).toBe(CardStatus.Placed)
      expect(store.getCardById('g2')?.status).toBe(CardStatus.Placed)
      expect(store.getCardById('g3')?.status).toBe(CardStatus.Placed)
    })

    it('picks a subset without duplicates when count is less than available', () => {
      const store = setupGoldenCards()

      const goalCards = store.pickGoalCards(2)

      expect(goalCards).toHaveLength(2)
      expect(new Set(goalCards).size).toBe(2)
      goalCards.forEach(id => {
        expect(['g1', 'g2', 'g3']).toContain(id)
        expect(store.getCardById(id)?.status).toBe(CardStatus.Placed)
      })
    })

    it('returns all golden cards when count exceeds available', () => {
      const store = setupGoldenCards()

      const goalCards = store.pickGoalCards(10)

      expect([...goalCards].sort()).toEqual(['g1', 'g2', 'g3'])
    })

    it('does not affect non-golden cards', () => {
      const store = setupGoldenCards()

      store.pickGoalCards(3)

      expect(store.getCardById('n1')?.status).toBe(CardStatus.Deck)
    })
  })

  describe('getOutPortsByCardIDAndPortIndex', () => {
    it('returns undefined when card does not exist', () => {
      const store = useCardStore()
      const outPorts = store.getOutPortsByCardIDAndPortIndex('nonexistent-id', 0)
      expect(outPorts).toBeUndefined()
    })

    it('returns undefined when there is no port at the given index', () => {
      const store = useCardStore()
      store.cards.set('test-card', makeCard({
        id: 'test-card',
        ports: [undefined, { group: 1 }, { group: 1 }, undefined]
      }))
      const outPorts = store.getOutPortsByCardIDAndPortIndex('test-card', 0)
      expect(outPorts).toBeUndefined()
    })

    it('returns ports of the same group excluding the entry port', () => {
      const store = useCardStore()
      const ports: ICardPorts = [{ group: 1 }, { group: 1 }, { group: 2 }, { group: 1 }]
      store.cards.set('test-card', makeCard({ id: 'test-card', ports }))

      const outPorts = store.getOutPortsByCardIDAndPortIndex('test-card', 0)

      expect(outPorts).toEqual([
        undefined, 
        { group: 1 },
        undefined,
        { group: 1 },
      ])
    })

    it('returns all undefined when no other port shares the group', () => {
      const store = useCardStore()
      const ports: ICardPorts = [{ group: 1 }, { group: 2 }, { group: 3 }, { group: 4 }]
      store.cards.set('test-card', makeCard({ id: 'test-card', ports }))

      const outPorts = store.getOutPortsByCardIDAndPortIndex('test-card', 0)

      expect(outPorts).toEqual([undefined, undefined, undefined, undefined])
    })
  })
})