import type { ICard } from '@/types'
import { CardStatus } from '@/types/card'

export default function makeCard(overrides: Partial<ICard> = {}): ICard {
  return {
    id: 'test-card',
    ports: [
      { group: 1 },
      { group: 2 },
      { group: 3 },
      { group: 4 },
    ],
    actions: [],
    isGolden: false,
    style: {},
    status: CardStatus.Deck,
    owner: null,
    rotation: false,
    isRevealed: false,
    ...overrides,
  }
}